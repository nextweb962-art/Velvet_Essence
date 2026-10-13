import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "تسجيل الدخول",
  description: "سجّلي الدخول إلى حسابك في فيلفت إسنس لتتبّع طلباتك وحفظ مفضّلاتك.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reason?: string; error?: string }>;
}) {
  const { redirectTo, reason, error } = await searchParams;

  return (
    <AuthShell
      mode="login"
      redirectTo={redirectTo}
      reason={reason}
      urlError={error}
      title={
        <>
          أهلاً <span className="text-rose-700">بعودتك</span>
        </>
      }
      copy="سجّلي الدخول لترى درجاتك المحفوظة وقائمة أمنياتك وحالة كل طلب."
    />
  );
}
