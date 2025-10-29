import Specialization from '../models/specializationModel.js';

export const createSpecialization = async (req, res) => {
  try {
    const { name, description, image, symptom } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Tên và mô tả không được để trống',
      });
    }

    const specialization = new Specialization({
      name,
      description,
      image,
      symptom,
    });

    const saved = await specialization.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo chuyên khoa thành công',
      data: saved,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo chuyên khoa: ' + error.message,
    });
  }
};

export const updateSpecialization = async (req, res) => {
    try {
      const { specializationId } = req.params;
      const { name, description, image, symptom } = req.body;
  
      if (!name || !description || !image || !symptom) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const updatedSpecialization = await Specialization.findOneAndUpdate(
        { _id: specializationId },
        { name, description, image, symptom },
        { new: true, runValidators: true }
      );
  
      if (!updatedSpecialization) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Specialization updated successfully",
        data: updatedSpecialization,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while updating specialization",
        error: error.message,
      });
    }
  };