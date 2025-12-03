import Medication from '../models/Medication.js';
import { deleteImage, getImageUrl } from '../middleware/handleUploadMedicationImage.js';

export const createMedication = async (req, res) => {
  try {
    const { name, genericName, description, form, unit } = req.body;

    if (!name || !form || !unit) {
      // Xóa ảnh nếu upload thất bại
      if (req.file) {
        deleteImage(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Tên thuốc, dạng và đơn vị là những trường bắt buộc',
      });
    }

    let imageUrl = '';

    // Lấy URL ảnh từ middleware upload
    if (req.file) {
      imageUrl = getImageUrl(req.file.filename);
    }

    const newMedication = new Medication({
      name,
      genericName: genericName || '',
      description: description || '',
      form,
      unit,
      imageUrl,
    });

    const savedMedication = await newMedication.save();

    return res.status(201).json({
      success: true,
      message: 'Thuốc được tạo thành công',
      data: savedMedication,
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    // Xóa ảnh nếu tạo thuốc thất bại
    if (req.file) {
      deleteImage(req.file.filename);
    }
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo thuốc',
      error: error.message,
    });
  }
};

export const getAllMedication = async (req, res) => {
  try {
    const medications = await Medication.find();
    if (medications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc nào',
      });
    }
    return res.status(200).json({
      success: true,
      count: medications.length,
      data: medications,
      message: `Tìm thấy ${medications.length} thuốc`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách thuốc',
      error: error.message,
    });
  }
};

export const getMedicationById = async (req, res) => {
  try {
    const { medicationId } = req.params;
    if (!medicationId) {
      const medications = await Medication.find();
      return res.status(200).json({
        success: true,
        count: medications.length,
        data: medications,
      });
    }

    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc',
      });
    }
    return res.status(200).json({
      success: true,
      data: medication,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thuốc',
      error: error.message,
    });
  }
};

export const updateMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { name, genericName, description, form, unit } = req.body;

    // Kiểm tra medication tồn tại
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      if (req.file) {
        deleteImage(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc',
      });
    }

    let imageUrl = medication.imageUrl; // Giữ ảnh cũ

    // Xử lý upload ảnh mới nếu có
    if (req.file) {
      // Xóa ảnh cũ
      deleteImage(medication.imageUrl);
      imageUrl = getImageUrl(req.file.filename);
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      medicationId,
      {
        name: name || medication.name,
        genericName: genericName || medication.genericName,
        description: description || medication.description,
        form: form || medication.form,
        unit: unit || medication.unit,
        imageUrl,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thuốc thành công',
      data: updatedMedication,
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    if (req.file) {
      deleteImage(req.file.filename);
    }
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật thuốc',
      error: error.message,
    });
  }
};

export const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc',
      });
    }

    // Xóa ảnh
    deleteImage(medication.imageUrl);

    const deletedMedication = await Medication.findByIdAndDelete(medicationId);

    return res.status(200).json({
      success: true,
      message: 'Xóa thuốc thành công',
      data: deletedMedication,
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa thuốc',
      error: error.message,
    });
  }
};
