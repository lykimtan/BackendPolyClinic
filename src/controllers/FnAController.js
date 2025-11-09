import FnA from '../models/FnA.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

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

export const updateFnA = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, answer, img, isPublished } = req.body;

    if (!id || !doctorId || !answer) {
      return res.status(400).json({ message: 'fnA id, doctorId and answer are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid FnA ID format' });
    }

    const updatedFnA = await FnA.findByIdAndUpdate(
      id,
      {
        doctorId,
        answer,
        status: 'answered',
        ...(img && { img }),
        ...(isPublished !== undefined && { isPublished }),
      },
      { new: true }
    );

    if (!updatedFnA) {
      return res.status(404).json({ message: 'FnA not found' });
    }

    res.status(200).json({
      success: true,
      message: 'FnA updated successfully',
      data: updatedFnA,
    });
  } catch (error) {
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
