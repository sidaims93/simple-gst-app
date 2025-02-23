# simple-gst-app
This is a GST app which I will build live on YouTube.

Some info (might be re-factored later lol)
Tech stack: ExpressJS + MySQL (Sequelize)
Authentication: Passport JS (Bearer token based Auth)
Misc: 
    1. Roles and permissions management.
    2. Migrations and seeders.
    3. Payment processor (Mollie)
    4. Any user signing up is a part of an organization. (Staff accounts) 
    5. Bcrypt JS for password hashing.

Backend API project   
Postman API collection

Models: 

1. User model (id, email, password, status, active, customer_id)
2. Organizations model (Id, name, API Key)
3. User-Organization model (Id, User ID, Org ID, status)
