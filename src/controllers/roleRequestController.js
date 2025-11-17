import RoleRequest from '../models/RoleRequest.js';
import User from '../models/User.js';

// Upload document proof for role request
export const uploadDocumentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Construct the document URL (relative path to store in DB)
    const documentUrl = `/uploads/roleRequests/documents/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentUrl,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Submit a new role request
export const submitRoleRequest = async (req, res) => {
  try {
    const { requestedRole, documentProof, licenseNumber, specializationIds } = req.body;

    // Validate required fields
    if (!requestedRole) {
      return res.status(400).json({
        success: false,
        message: 'Requested role is required',
      });
    }

    // Kiểm tra nếu user đã có yêu cầu đang chờ xử lý
    const existingRequest = await RoleRequest.findOne({ userId: req.user._id, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending role request',
      });
    }

    // Parse specializationIds if it's a string
    let parsedSpecializationIds = specializationIds;
    if (typeof specializationIds === 'string') {
      try {
        parsedSpecializationIds = JSON.parse(specializationIds);
        r;
      } catch (e) {
        parsedSpecializationIds = specializationIds.split(',').filter((id) => id);
      }
    }

    const roleRequest = new RoleRequest({
      userId: req.user._id,
      requestedRole,
      documentProof,
      licenseNumber,
      specializationIds: parsedSpecializationIds,
    });
    await roleRequest.save();

    res.status(201).json({
      success: true,
      message: 'Role request submitted successfully',
      data: roleRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all pending role requests (Admin only)
export const getAllPendingRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's own role requests
export const getUserRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve role request (Admin only)
export const acceptRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const roleRequest = await RoleRequest.findById(requestId);
    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Role request not found',
      });
    }

    // Check if already processed
    if (roleRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request already ${roleRequest.status}`,
      });
    }

    const requestedRole = roleRequest.requestedRole;

    // Find the user first
    const user = await User.findById(roleRequest.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user properties
    user.role = requestedRole;

    // If role is doctor, add specialization and license
    if (requestedRole === 'doctor') {
      if (roleRequest.specializationIds && roleRequest.specializationIds.length > 0) {
        user.specializationIds = roleRequest.specializationIds;
      }
      if (roleRequest.licenseNumber) {
        user.licenseNumber = roleRequest.licenseNumber;
      }
    }

    // Save the user (this will trigger pre('save') middleware)
    const updatedUser = await user.save();

    // Update request status
    roleRequest.status = 'approved';
    roleRequest.reviewedBy = req.user._id;
    roleRequest.reviewedAt = new Date();
    await roleRequest.save();

    res.status(200).json({
      success: true,
      message: 'Role request approved and user role updated',
      data: roleRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectedRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { note } = req.body;
    const roleRequest = await RoleRequest.findById(requestId);
    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Role request not found',
      });
    }

    // Cập nhật trạng thái yêu cầu
    roleRequest.status = 'rejected';
    roleRequest.note = note;

    await roleRequest.save();

    res.status(200).json({
      success: true,
      message: 'Role request rejected',
      data: roleRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const roleRequest = await RoleRequest.findByIdAndDelete(requestId);
    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Role request not found',
      });
    }

    if (roleRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be deleted',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role request deleted',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
