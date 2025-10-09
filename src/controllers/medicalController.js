import Medication from '../models/Medication.js';

export const createMedication = async (req, res) => {
    try {
        const { name, genericName, description, form, unit } = req.body;

        if(!name || !form || !unit) {
            return res.status(400).json({ message: 'Tên, dạng thuốc và đơn vị không được để trống' });
        }

        const newMedication = new Medication({
            name,
            genericName,
            description,
            form,
            unit,
            imageUrl: req.body.imageUrl || '', //nếu không có imageUrl thì để trống
        });

        const savedMedication = await newMedication.save();
        //ham save se return ve mot document duoc luu thanh cong trong db
        res.status(201).json(savedMedication);  
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo thuốc', error });
    }
}

export const getMedication = async (req, res) => {
    try {
        const medicationId = req.params.id;
        if(medicationId) {
            const medication = await Medication.findById(medicationId);
            if(!medication) {
                return res.status(404).json({ message: 'Không tìm thấy thuốc' });
            }
            return res.status(200).json(medication);
        }
        const medications = await Medication.find();
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thuốc', error });
    }
}

export const updateMedication = async (req, res) => {
    try {
        const medicationId = req.params.id;
        const { name, genericName, description, form, unit} = req.boy;
        
        const updatedMedication = await Medication.findByIdAndUpdate(
            medicationId, 
            { name, genericName, description, form, unit },
            { new: true } //tra ve document da duoc cap nhat
        )
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thuốc', error });
    }
};

export const deleteMedication = async (req, res) => {
    try {
        const medicalHistoryId = req.params.id;
        const deletedMedication = await Medication.findByIdAndDelete(medicationId);
        if(!deletedMedication) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }
        res.status(200).json({ message: 'Xóa thuốc thành công' });
    } catch (error) {
        res.status(500).json({message: "Lỗi xảy ra khi xóa thuốc", error})
    }
}