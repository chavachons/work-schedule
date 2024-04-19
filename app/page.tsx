import prisma from "@/lib/prisma";
import Calendar from "./ui/Caledar";
import { useEffect } from "react";
import { getSchedule } from "@/lib/schedule";
export default async function Home() {
  // const schedule = await getSchedule();
  // console.log(schedule);
  return (
    <main className="flex min-h-screen flex items-center justify-between">
      <Calendar />
    </main>
  );
}
