import { auth } from "@/src/services/firebase";
import { redirect } from "next/navigation";

const Home = () => {
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  return <div>Home</div>;
};

export default Home;
