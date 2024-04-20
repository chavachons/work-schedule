"use server";
import moment from "moment";
import prisma from "./prisma";
import { cache } from "react";
export interface ISchedule {
  id?: string;
  date: Date;
  period: string;
}

export const getSchedule = cache(async () => {
  const item = await prisma.schedule.findMany();
  return item;
});

export async function updateWorkSchedule(date: Date, schedules: ISchedule[]) {
  try {
    const deleteSchedules = prisma.schedule.deleteMany({
      where: {
        date,
      },
    });
    const createSchedules = prisma.schedule.createMany({
      data: schedules,
    });

    await prisma.$transaction([deleteSchedules, createSchedules]);
  } catch (error) {
    console.error(error);
  }
}
