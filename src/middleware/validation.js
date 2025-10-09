// Validation middleware for user registration
export const validateUserRegistration = (req, res, next) => {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const errors = [];

    // Required fields validation
    if (!firstName || firstName.trim().length === 0) {
        errors.push('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
        errors.push('Last name is required');
    }

    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        // Email format validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please provide a valid email address');
        }
    }

    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!phone || phone.trim().length === 0) {
        errors.push('Phone number is required');
    } else {
        // Phone format validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone)) {
            errors.push('Please provide a valid phone number');
        }
    }

    // Role validation
    const validRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'patient'];
    if (role && !validRoles.includes(role)) {
        errors.push('Invalid role specified');
    }

    // Role-specific validation
    if (role === 'patient') {
        const { dateOfBirth, gender, bloodType } = req.body;
        
        if (!dateOfBirth) {
            errors.push('Date of birth is required for patients');
        }
        
        if (!gender) {
            errors.push('Gender is required for patients');
        } else if (!['male', 'female', 'other'].includes(gender)) {
            errors.push('Invalid gender specified');
        }
        
        if (!bloodType) {
            errors.push('Blood type is required for patients');
        } else if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodType)) {
            errors.push('Invalid blood type specified');
        }
    }

    if (['doctor', 'nurse'].includes(role)) {
        const { department, yearsOfExperience } = req.body;
        
        if (!department || department.trim().length === 0) {
            errors.push(`Department is required for ${role}s`);
        }
        
        if (yearsOfExperience === undefined || yearsOfExperience < 0) {
            errors.push('Years of experience is required and must be a positive number');
        }
        
        if (role === 'doctor') {
            const { specialization, licenseNumber } = req.body;
            
            if (!specialization || specialization.trim().length === 0) {
                errors.push('Specialization is required for doctors');
            }
            
            if (!licenseNumber || licenseNumber.trim().length === 0) {
                errors.push('License number is required for doctors');
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};

// Validation middleware for user login
export const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please provide a valid email address');
        }
    }

    if (!password || password.trim().length === 0) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};

// Validation middleware for password change
export const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];

    if (!currentPassword || currentPassword.trim().length === 0) {
        errors.push('Current password is required');
    }

    if (!newPassword || newPassword.trim().length === 0) {
        errors.push('New password is required');
    } else if (newPassword.length < 6) {
        errors.push('New password must be at least 6 characters long');
    }

    if (currentPassword === newPassword) {
        errors.push('New password must be different from current password');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};

// General validation middleware for ObjectId
export const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    next();
};