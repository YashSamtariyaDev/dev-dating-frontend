import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
  return (
    <div className="dd-auth-surface min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold tracking-tight text-foreground">DevDating</div>
          <div className="mt-1 text-sm text-muted-foreground">Create your account</div>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
