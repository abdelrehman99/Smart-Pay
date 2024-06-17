import Users from './model.js';
import logger from '../../config/logger.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, phone, password, role, city, gender, birthDate, email } =
      req.body;

    const smartEmail = email?.split('@')[0] + '@smartpay.com';

    let user = await Users.create({
      name,
      phone,
      password,
      role,
      city,
      gender,
      birthDate,
      smartEmail,
    });

    const token = signToken(user._id);
    user.password = undefined;
    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (err) {
    logger.error(`[signup] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    let user = await Users.findOne({ phone }).select('+password');
    let isCorrectPassword = false;

    if (user) {
      isCorrectPassword = await bcrypt.compare(password, user?.password);
    }

    if (!isCorrectPassword) {
      res.status(500).json({
        status: 'failed',
        message: 'Wrong password or phone number',
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    logger.info(`[Login] user ${user.name} signed in successfully`);
    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (err) {
    logger.error(`[Login] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

// const stats = async (req, res, next) => {
//   try {
//     let { page = 0, limit = 0 } = req.query;
//     const user = req.user;
//     page = Number(page);
//     limit = Number(limit);

//     if (user.role != ADMIN)
//       res.status(401).json({
//         status: 'failed',
//         message: 'This user is not allowed to perform this operation',
//       });

//     const skip = (page - 1) * limit;

//     const adsLookupPipeline = [
//       {
//         $lookup: {
//           from: 'ads',
//           localField: '_id',
//           foreignField: 'owner.userId',
//           as: 'ADS',
//         },
//       },
//       {
//         $unwind: {
//           path: '$ADS',
//         },
//       },
//       {
//         $facet: {
//           // Pagination stage
//           pagination: [
//             { $skip: (page - 1) * limit }, // Skip documents for pagination
//             { $limit: limit }, // Limit documents for pagination
//           ],
//           // Count stage
//           count: [
//             { $count: 'totalDocuments' }, // Count total documents
//           ],
//         },
//       },
//     ];

//     // Lookup for properties
//     const propertiesLookupPipeline = [
//       {
//         $lookup: {
//           from: 'properties',
//           localField: '_id',
//           foreignField: 'owner.userId',
//           as: 'Properties',
//         },
//       },
//       {
//         $unwind: {
//           path: '$Properties',
//         },
//       },
//       {
//         $facet: {
//           // Pagination stage
//           pagination: [
//             { $skip: (page - 1) * limit }, // Skip documents for pagination
//             { $limit: limit }, // Limit documents for pagination
//           ],
//           // Count stage
//           count: [
//             { $count: 'totalDocuments' }, // Count total documents
//           ],
//         },
//       },
//     ];

//     // Run aggregation for ads lookup
//     const adsLookupResult = await Users.aggregate(adsLookupPipeline);

//     // Run aggregation for properties lookup
//     const propertiesLookupResult = await Users.aggregate(
//       propertiesLookupPipeline
//     );

//     // Extract pagination and count results for ads
//     const adsPagination =
//       adsLookupResult.length > 0 ? adsLookupResult[0].pagination : [];
//     const adsTotalDocuments =
//       adsLookupResult.length > 0
//         ? adsLookupResult[0].count[0].totalDocuments
//         : 0;

//     // Extract pagination and count results for properties
//     const propertiesPagination =
//       propertiesLookupResult.length > 0
//         ? propertiesLookupResult[0].pagination
//         : [];
//     const propertiesTotalDocuments =
//       propertiesLookupResult.length > 0
//         ? propertiesLookupResult[0].count[0].totalDocuments
//         : 0;

//     console.log(adsPagination); // Paginated ads data
//     console.log(adsTotalDocuments); // Total count of ads documents

//     console.log(propertiesPagination); // Paginated properties data
//     console.log(propertiesTotalDocuments); // Total count of properties documents

//     res.status(200).json({
//       status: 'success',
//       // users,
//       // total: count,
//       // page,
//       // limit,
//       // hasNextPage: page * limit < count,
//       // hasPreviousPage: page > 1,
//       // data,
//     });
//   } catch (err) {
//     console.error(err);
//     logger.error(`[Stats] error occurred ${err}`);

//     res.status(500).json({
//       status: 'failed',
//       message: err.message,
//     });
//   }
// };

export default { signup, login };
