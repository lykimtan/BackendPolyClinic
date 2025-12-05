import FnA from '../models/FnA.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { deleteImage, getImageUrl } from '../middleware/handleUploadFnAImage.js';
import { io } from '../app.js';

export const createFrequencyQuestion = async (req, res) => {
  try {
    const { askerId, question, isConfidential } = req.body;
    if (!askerId || !question) {
      return res.status(400).json({ message: 'askerId and question are required' });
    }
    const asker = await User.findById(askerId);
    if (!asker) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newQuestion = new FnA({
      askerId,
      question,
      isConfidential: isConfidential !== undefined ? isConfidential : true,
    });
    await newQuestion.save();
    return res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, isConfidential } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'FnA id is required' });
    }

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid FnA ID format' });
    }

    // Chỉ cho phép update câu hỏi nếu chưa được trả lời
    const currentFnA = await FnA.findById(id);
    if (!currentFnA) {
      return res.status(404).json({ message: 'FnA not found' });
    }

    if (currentFnA.status === 'answered') {
      return res.status(400).json({ message: 'Cannot update question that has been answered' });
    }

    const updateData = {
      question: question.trim(),
    };

    if (isConfidential !== undefined) {
      updateData.isConfidential = isConfidential;
    }

    const updatedFnA = await FnA.findByIdAndUpdate(id, updateData, { new: true })
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedFnA,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFnA = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, answer, isPublished } = req.body;

    if (!id || !doctorId || !answer) {
      return res.status(400).json({ message: 'fnA id, doctorId and answer are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid FnA ID format' });
    }

    // Lấy FnA hiện tại để kiểm tra ảnh cũ
    const currentFnA = await FnA.findById(id);
    if (!currentFnA) {
      return res.status(404).json({ message: 'FnA not found' });
    }

    // Chuẩn bị update data
    const updateData = {
      doctorId,
      answer,
      status: 'answered',
      ...(isPublished !== undefined && { isPublished }),
    };

    // Nếu có file upload, xử lý ảnh
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (currentFnA.img) {
        deleteImage(currentFnA.img);
      }
      // Lưu đường dẫn ảnh mới
      updateData.img = getImageUrl(req.file.filename);
    }

    const updatedFnA = await FnA.findByIdAndUpdate(id, updateData, { new: true });

    // Get doctor and asker info for notification
    const doctor = await User.findById(doctorId);
    const fnaData = await FnA.findById(id).populate('askerId', 'firstName lastName');

    // Create notification for asker
    const notification = new Notification({
      userId: fnaData.askerId._id,
      notificator: doctorId,
      title: 'Câu hỏi của bạn đã được trả lời',
      type: 'fna',
      content: `${doctor.firstName} ${doctor.lastName} vừa trả lời câu hỏi: "${fnaData.question.substring(0, 50)}..."`,
      data: {
        model: 'FnA',
        resourceId: id,
        route: `/fna-forum`,
      },
    });
    await notification.save();

    // Emit notification via Socket.io to asker
    io.to(fnaData.askerId._id.toString()).emit('receive_notification', notification);

    res.status(200).json({
      success: true,
      message: 'FnA updated successfully',
      data: updatedFnA,
    });
  } catch (error) {
    // Nếu có lỗi, xóa file đã upload
    if (req.file) {
      deleteImage(req.file.filename);
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAllFnA = async (req, res) => {
  try {
    const fnas = await FnA.find()
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');
    res.status(200).json({ data: fnas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFnAByAsker = async (req, res) => {
  try {
    const { askerId } = req.params;
    if (!askerId) {
      return res.status(400).json({ message: 'Asker id is required' });
    }

    const asker = await User.findById(askerId);
    if (!asker) {
      return res.status(404).json({ message: 'User not found' });
    }
    const fnas = await FnA.find({ askerId })
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');
    res.status(200).json({ data: fnas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFnAByResponder = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor id is required' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'User not found' });
    }
    const fnas = await FnA.find({ doctorId })
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');
    res.status(200).json({ data: fnas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPublishedFnA = async (req, res) => {
  try {
    const fnas = await FnA.find({ isPublished: true })
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');
    res.status(200).json({ data: fnas });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFnA = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'FnA id is required' });
    }

    const deletedFnA = await FnA.findByIdAndDelete(id);
    if (!deletedFnA) {
      return res.status(404).json({ message: 'FnA not found' });
    }
    res.status(200).json({ message: 'FnA deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'FnA id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid FnA ID format' });
    }

    const fna = await FnA.findById(id);
    if (!fna) {
      return res.status(404).json({ message: 'FnA not found' });
    }

    // Xóa ảnh nếu có
    if (fna.img) {
      deleteImage(fna.img);
    }

    // Reset câu trả lời về trạng thái pending
    const updatedFnA = await FnA.findByIdAndUpdate(
      id,
      {
        doctorId: null,
        answer: null,
        img: null,
        status: 'pending',
      },
      { new: true }
    )
      .populate('askerId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully',
      data: updatedFnA,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFnAPublicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ message: 'isPublished must be a boolean' });
    }
    const updatedFnA = await FnA.findByIdAndUpdate(id, { isPublished }, { new: true });

    if (!updatedFnA) {
      return res.status(404).json({ message: 'FnA not found' });
    }

    res.status(200).json({
      success: true,
      message: 'FnA publication status updated successfully',
      data: updatedFnA,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
