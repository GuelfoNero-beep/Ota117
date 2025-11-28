
import { Event } from '../types';

// Formats a date string into the required iCalendar format (YYYYMMDDTHHMMSSZ)
const formatIcsDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateIcsFile = (event: Event) => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OrienteO117//App//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@orienteo117.app`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(event.dataInizio)}`,
    `DTEND:${formatIcsDate(event.dataFine)}`,
    `SUMMARY:${event.nome}`,
    `DESCRIPTION:${event.descrizione.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadIcsFile = (icsContent: string, filename: string) => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
