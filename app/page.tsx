import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to admin login so the site opens at the login page
  redirect("/admin/login");
}
