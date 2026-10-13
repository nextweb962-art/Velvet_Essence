import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "إنشاء حساب",
  description:
    "انضمي إلى قائمة عميلات فيلفت إسنس لتتبّع الطلبات وقائمة الأمنيات والوصول المبكر للإصدارات المحدودة.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reason?: string; error?: string }>;
}) {
  const { redirectTo, reason, error } = await searchParams;

  return (
    <AuthShell
      mode="signup"
      redirectTo={redirectTo}
      reason={reason}
      urlError={error}
      title={
        <>
          انضمي إلى <span className="text-rose-700">الدار</span>
        </>
      }
      copy="حساب واحد لتتبّع الطلبات، وقائمة الأمنيات، والأولوية في الإصدارات المحدودة."
    />
  );
}
