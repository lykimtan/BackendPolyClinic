export const createSlots = (start, end, inteval) => {
    const slots = [];
    let current = new Date(`1970-01-01T${start}:00`);
    // T dùng để ngăn cách ngày và giờ
    //mẫu có ngày vì date luôn yêu cầu có ngày tháng năm
    const endTime = new Date(`1970-01-01T${end}:00`);


    while (current < endTime) {
        const time = current.toTimeString().substring(0,5); //cắt ra dạng HH:MM
        slots.push({ time, isBooked: false});
        current.setMinutes(current.getMinutes() + inteval);
    }
    return slots;
}