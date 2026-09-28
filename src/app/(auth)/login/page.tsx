import LoginForm from "@/app/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : undefined;

  return <LoginForm redirectTo={redirectTo} />;
}
