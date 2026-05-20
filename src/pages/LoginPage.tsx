import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Leaf, Mail, Lock, User, Loader2, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const signupSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, enterGuestMode } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleLogin(data: LoginFormData) {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao fazer login", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(data: SignupFormData) {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success("Conta criada com sucesso!", { description: "Você já pode fazer login." });
    } catch (error: any) {
      toast.error("Erro ao criar conta", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleGuestAccess() {
    enterGuestMode();
    toast.success("Bem-vindo ao modo visitante!", {
      description: "Explore o sistema livremente. Nenhuma ação será salva.",
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative">
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao início</span>
        </Link>
        
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            SEMA
          </h1>
          <p className="text-xl text-white/80 mb-2">
            Secretaria de Meio Ambiente
          </p>
          <p className="text-white/60 max-w-md mx-auto">
            Sistema integrado de gestão ambiental para monitoramento, fiscalização e licenciamento.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Mobile Back Button */}
        <Link 
          to="/" 
          className="lg:hidden absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>
        
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8 mt-8">
            <div className="w-16 h-16 rounded-2xl gradient-nature flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SEMA</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
                  <p className="text-muted-foreground">Entre com suas credenciais</p>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} type="email" placeholder="seu@email.com" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Criar Conta</h2>
                  <p className="text-muted-foreground">Preencha os dados para se cadastrar</p>
                </div>

                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} placeholder="Seu nome completo" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} type="email" placeholder="seu@email.com" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>

          {/* Guest Access */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Quer conhecer o sistema sem cadastro?
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 border-accent/50 text-accent hover:bg-accent/10"
              onClick={handleGuestAccess}
            >
              <Eye className="w-4 h-4" />
              Entrar como Visitante
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Acesso somente leitura para exploração do sistema
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Acesso restrito a colaboradores da Secretaria de Meio Ambiente
          </p>
        </div>
      </div>
    </div>
  );
};
