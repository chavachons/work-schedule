"use server";
import prisma from "./prisma";
import { cache } from "react";

export const getSchedule = cache(async () => {
  const item = await prisma.schedule.findMany();
  return item;
});
