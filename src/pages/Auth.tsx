import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy, Target, Bot, BarChart3, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    document.title = 'logo - Seu assistente de produtividade';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await signIn(formData.email, formData.password);
    } else {
      await signUp(formData.email, formData.password, formData.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Metas Inteligentes",
      description: "Organize e acompanhe seu progresso"
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: "IA Assistente",
      description: "Sugestões personalizadas diárias"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Dashboard Visual",
      description: "Visualize sua evolução em tempo real"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="text-center pt-12 pb-8">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">logo</h1>
        <p className="text-muted-foreground">Seu assistente de produtividade</p>
      </header>

      <div className="flex-1 px-6 pb-8">
        {!isLogin && (
          <>
            {/* Features */}
            <div className="mb-8 space-y-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-4 bg-card/50 backdrop-blur-sm border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Auth Form */}
        <Card className="p-6 bg-card border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-card-foreground">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 bg-input border-input-border"
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-card-foreground">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 bg-input border-input-border"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-card-foreground">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-input border-input-border pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary">
              {isLogin ? 'Entrar' : 'Começar Agora'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover font-medium"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </Card>

        {!isLogin && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setIsLogin(true)}
              className="btn-secondary w-full"
            >
              Explorar Funcionalidades
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Transforme seus objetivos em conquistas diárias
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;