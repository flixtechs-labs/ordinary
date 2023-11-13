import { codes, statuses } from './config.js';

export const remarkable = (error, req, res, next) => {
    if (error.message === codes.UNPROCESSABLE_ENTITY) {
        //if the clients expects json return json else redirect back with errors in session and old input
        if (req.accepts('application/json') || req.get('X-Requested-With') === 'XMLHttpRequest' || req.is('application/json')) {
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
