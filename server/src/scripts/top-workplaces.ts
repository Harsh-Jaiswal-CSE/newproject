import axios from 'axios';
import https from 'https';

interface Workplace {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  workplaceId: string;
}

const agent = new https.Agent({
  rejectUnauthorized: false, // Only for test
});

const fetchWorkplaces = async (): Promise<Workplace[]> => {
  const res = await axios.get<Workplace[]>('https://backend.joinclipper.com/api/workplaces', {
    httpsAgent: agent,
  });
  return res.data;
};

const fetchShifts = async (): Promise<Shift[]> => {
  const res = await axios.get<Shift[]>('https://backend.joinclipper.com/api/shifts', {
    httpsAgent: agent,
  });
  return res.data;
};

const main = async () => {
  try {
    const [workplaces, shifts] = await Promise.all([fetchWorkplaces(), fetchShifts()]);

    const shiftCounts: Record<string, number> = {};
    for (const shift of shifts) {
      shiftCounts[shift.workplaceId] = (shiftCounts[shift.workplaceId] || 0) + 1;
    }

    const topWorkplaces = workplaces
      .map((wp) => ({
        name: wp.name,
        shifts: shiftCounts[wp.id] || 0,
      }))
      .sort((a, b) => b.shifts - a.shifts)
      .slice(0, 3);

    console.log(JSON.stringify(topWorkplaces, null, 2));
  } catch (err) {
    console.error('Error fetching or processing data:', err);
  }
};

main();
