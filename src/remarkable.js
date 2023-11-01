import { codes, statuses } from './config.js';

export const remarkable = (error, req, res, next) => {
    console.log(error);
    if (error.message === codes.UNPROCESSABLE_ENTITY) {
        //if the clients expects json return json else redirect back with errors in session and old input
        if (req.accepts('json') && !req.accepts('html')) {
            return res.status(statuses.UNPROCESSABLE_ENTITY).json({
                message: error.message,
                errors: error.errors,
            });
        }

        req.session.errors = error.errors;
        req.session.old = req.body;

        return res.redirect('back');
    }

    next(error);
};