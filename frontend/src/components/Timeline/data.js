import { getTimeline } from "../../api/services";

export const getBranches = async () => {
  try {
    const res = await getTimeline();

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.map((item, i) => ({
       id: item.event_id != null 
  ? `${item.event_id}-${i}` 
  : `idx-${i}`,

        //  position (same as your original logic)
        y: 200 + i * 240,
        side: i % 2 === 0 ? 1 : -1,

        //  content from backend
        title: item.event_title || `Phase ${i + 1}`,
        subtitle: item.event_subtitle || "",

        date: item.event_date
          ? new Date(item.event_date).toDateString()
          : "",

        description:
          item.event_description ||
          "No description available for this phase.",
      }));
    }

    return [];
  } catch (err) {
    console.error("Error fetching branches:", err);
    return [];
  }
};