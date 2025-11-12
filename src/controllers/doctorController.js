import User from '../models/User.js';

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({role: 'doctor'})
            .populate('specializationIds');
        if(!doctors || doctors.length === 0) {
            return res.status(404).json({ message: 'No doctors found' });
        }

        res.status(200).json({
            data: doctors,
            message: 'Doctors fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors' });
    }

}

export const getDoctorById = async (req, res) => {
    try {
        
        const doctor = await User.findById(req.params.id)
            .populate('specializationIds');
        
        if(!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({
            data: doctor,
            message: 'Doctor fetched successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching doctor' });
    }
}

export const getAllDoctorBySpecialization = async (req, res) => {
    try {
        const {id} = req.params;
        const doctors = await User.find({role: 'doctor', specializationIds: {$in: [id]}})
            .populate('specializationIds');
        if(!doctors || doctors.length === 0) {
            return res.status(404).json({ message: 'No doctors found for this specialization' });
        }

        res.status(200).json({
            data: doctors,
            message: 'Doctors fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors' });
    }
}