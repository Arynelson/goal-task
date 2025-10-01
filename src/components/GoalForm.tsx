import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { goalSchema, type GoalFormData } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface GoalFormProps {
  children: React.ReactNode;
  onGoalCreated?: () => void;
}

const categories = [
  { value: 'personal', label: 'personal' },
  { value: 'professional', label: 'professional' },
  { value: 'health', label: 'health' },
  { value: 'education', label: 'education' },
  { value: 'finance', label: 'finance' },
  { value: 'other', label: 'other' },
];

const GoalForm = ({ children, onGoalCreated }: GoalFormProps) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      importance_level: 3,
      effort_estimated: 3,
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create goal
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          target_date: data.target_date.toISOString().split('T')[0],
          importance_level: data.importance_level,
          effort_estimated: data.effort_estimated,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (goalError) throw goalError;

      toast({
        title: t('success'),
        description: t('goal-created'),
      });

      // Generate AI breakdown
      const { error: aiError } = await supabase.functions.invoke('generate-goal-breakdown', {
        body: {
          goalId: goalData.id,
          goal: {
            title: data.title,
            description: data.description,
            importance_level: data.importance_level,
            effort_estimated: data.effort_estimated,
          },
          targetDate: data.target_date.toISOString().split('T')[0],
          language,
        },
      });

      if (aiError) {
        console.error('AI breakdown error:', aiError);
        toast({
          title: t('error'),
          description: 'Goal created but AI task generation failed',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('success'),
          description: t('generating-tasks'),
        });
      }

      // Reset form and close dialog
      form.reset();
      setOpen(false);
      onGoalCreated?.();

    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: t('error'),
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const dateLocale = language === 'pt' ? ptBR : enUS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('create-goal')}
          </DialogTitle>
          <DialogDescription>
            {t('create-goal')} - AI will generate tasks automatically
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('goal-title')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('goal-title')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('goal-description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('goal-description')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('goal-category')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`${t('goal-category')}...`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {t(category.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('target-date')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: dateLocale })
                          ) : (
                            <span>{t('pick-date')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="importance_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('importance-level')}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">{field.value}/5</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effort_estimated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('effort-estimated')}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">{field.value}/5</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('creating-goal')}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;