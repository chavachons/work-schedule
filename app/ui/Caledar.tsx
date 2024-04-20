"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg, EventContentArg } from "@fullcalendar/core/index.js";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { Checkbox, Spinner } from "@nextui-org/react";
import { getSchedule, ISchedule, updateWorkSchedule } from "@/lib/schedule";
import moment from "moment";

export default function Calendar() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const calendarRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string | null>(null);
  const [data, setData] = useState<ISchedule[]>([]);
  const [workPeriod, setWorkPeriod] = useState([
    { value: "morning", label: "🌥 เช้า", isSelected: false },
    { value: "noon", label: "☀️ บ่าย", isSelected: false },
    { value: "night", label: "🌙 ดึก", isSelected: false },
    { value: "off", label: "🥰 หยุด", isSelected: false },
  ]);

  const eventManager = (date: Date | string) => {
    const mDate = moment(date);
    setDateSelected(mDate.format("YYYY-MM-DD"));
    const dateEvents = data.filter((event) => mDate.isSame(event.date, "date"));
    const activePeriod = dateEvents.map((event) => event.period);
    const activeWorkPeriod = workPeriod.map((event) => {
      return {
        ...event,
        isSelected: activePeriod.includes(event.value),
      };
    });
    setWorkPeriod(activeWorkPeriod);
    onOpen();
  };
  const handleDateClick = (arg: DateClickArg) => {
    eventManager(arg.dateStr);
  };
  const handleEventClick = (arg: EventClickArg) => {
    eventManager(arg.event.start!);
  };
  const updateSelectStatus = (index: number, isSelected: boolean) => {
    setWorkPeriod(
      workPeriod.map((event, currentIndex) =>
        currentIndex === index ? { ...event, isSelected } : event
      )
    );
  };
  const clearSelectStatus = () => {
    setWorkPeriod(
      workPeriod.map((event) => {
        return { ...event, isSelected: false };
      })
    );
  };

  const saveWork = async () => {
    setSubmiting(true);
    try {
      const date = new Date(dateSelected!);
      const selectedWork = workPeriod.filter((event) => event.isSelected);
      const dataInsert = selectedWork.map((workPeriod) => {
        return {
          date,
          period: workPeriod.value,
        };
      });
      await updateWorkSchedule(date, dataInsert);
      await getData();
      setSubmiting(false);
      onClose();
    } catch (error) {
      setSubmiting(false);
    }
  };

  const getData = async () => {
    setLoading(true);
    try {
      const data = await getSchedule();
      const scheduleData = data.map((i) => {
        const title = workPeriod.find((p) => p.value === i.period)?.label;
        return { ...i, title };
      });
      setData(scheduleData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="w-screen p-2">
      {loading ? (
        <div className="flex justify-center">
          <Spinner label="Loading..." color="warning" />
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          editable
          selectable
          initialView="dayGridMonth"
          contentHeight="auto"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          events={data}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={clearSelectStatus}
        onOpenChange={onOpenChange}
        backdrop="blur"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {dateSelected}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {workPeriod.map((workPeriod, index) => {
                    return (
                      <Checkbox
                        size="lg"
                        key={workPeriod.value}
                        value={workPeriod.value}
                        isSelected={workPeriod.isSelected}
                        onValueChange={(isSelected: boolean) =>
                          updateSelectStatus(index, isSelected)
                        }
                      >
                        {workPeriod.label}
                      </Checkbox>
                    );
                  })}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isLoading={submiting}
                  color="primary"
                  onPress={saveWork}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      {/* <b>{eventInfo.timeText}</b> */}
      <div className="tex-center">{eventInfo.event.title}</div>
    </>
  );
}
