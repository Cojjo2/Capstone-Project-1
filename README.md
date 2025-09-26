# Pup Pantry – Capstone Project Proposal

A full-stack web application to help dog owners filter food and treats by ingredient, making it easier to avoid harmful or allergenic substances.

**Project Title:** Pup Pantry  
**Student Name:** Ross Cozzo  
**School:** University of South Florida  
**Capstone Project – Web Development Track**

---

## Project Inspiration & Problem Statement

I was inspired to build Pup Pantry because I care deeply about what my dog eats. I try to limit preservatives, salt, and ingredients that might be harmful or trigger allergies in my dog. Right now, there’s no simple way to search for dog food or treats based on ingredients you want to avoid. Every time I shop, I have to inspect each product label manually, which is time-consuming and frustrating.

I want to make it easier for dog owners like me to find treats and food that are safe and healthy for their pets. Pup Pantry is my solution: a product filter and information hub that helps users identify trustworthy options without all the guesswork.

---

## Tech Stack

- **Frontend:** React with Vite for fast, modern development  
- **Backend:** Node.js with Express (custom API)  
- **Database:** MongoDB (to store products, ingredients, user preferences, and reviews)  
- **Authentication:** Email/password login using Express routes and localStorage  
- **Styling:** CSS  

---

## Project Type & Target Users

**Project Type:** Pup Pantry is a full-stack, responsive web application designed primarily as a website. It will be optimized for both desktop and mobile use to meet the Capstone rubric requirements.

**Target Users**  
- **Dog Owners:** People who want to ensure the food and treats they give their dogs are safe and free from harmful ingredients or allergens.  
- **Pet Professionals:** Dog sitters, trainers, groomers, and others who care for dogs and need quick access to safe food options.  
- **General Public:** Easy to use for users of any age or technical background  

---

## Features & Functionality

- **Product Directory:** A searchable list of dog food and treat products, showing images, brand names, ingredient lists, and prices.  
- **Ingredient Filtering:** Users can exclude specific ingredients they want to avoid, based on their dog’s dietary restrictions or allergies.  
- **User Accounts:** Users can sign up and log in with email and password to create a personal profile.  
- **Dog Profiles:** Within their account, users can add multiple dog profiles with details like name, breed, photo, and ingredient restrictions.  
- **Filtering Workflow:** The app will apply dog-specific ingredient restrictions automatically, and users can add temporary filters via a dropdown search box with a “Set Filter” button.  
- **Product Detail Pages:** Each product will have a dedicated page showing detailed information, availability by vendor/store, prices, and user reviews.  
- **Favorites, Ratings, and Reviews:** Users can save favorite products, leave star ratings, and write reviews.  
- **Automated Data Sync:** Product information will be kept current by syncing daily with free external APIs or a custom API.  

---

## User Flow

**User Signup & Profile Creation:**  
- Users create an account by signing up with their email and password.  
- They set up a personal profile with a name and optional profile photo.  
- Users add one or more dog profiles, including the dog’s name, breed, image, and ingredient restrictions.  

**Finding Food & Treats:**  
- Users use the search bar to find products by name or category.  
- They open the filter dropdown to exclude additional ingredients temporarily.  
- The app displays product results filtered based on the selected dog’s ingredient restrictions and any temporary filters.  
- Clicking a product image leads to a detail page with vendors, prices, ingredients, and user reviews.  

**Engaging with Products:**  
- Users can save favorite products to their profile for easy access later.  
- They can rate products with stars and submit reviews.  
- Profiles and dog details can be edited anytime using an “Edit Profile” button.  

---

## Data Sources & API Plan

I plan to use free, publicly available APIs that provide product data including:  
- Product name  
- Brand  
- Price  
- Ingredients  
- Images  

If suitable APIs are unavailable or limited in scope, I will create my own custom API to organize and serve product data cleanly to the frontend. To keep product information current, I will automate daily syncing through scheduled backend functions that pull data from these sources. This approach ensures the data stays fresh and reduces manual maintenance.

---

## Database & Schema

**Users**  
- id, name, email, password, profileImage  

**Dogs**  
- id, name, breed, image, ownerId, ingredientRestrictions  

**Products**  
- id, name, brand, imageUrl, price, ingredients, vendorIds, reviewIds  

**Vendors**  
- id, name, url, pricePerProduct  

**Reviews**  
- id, userId, productId, rating, comment, timestamp  

This schema allows flexible, efficient data storage and relationships needed for the app.

---

## Authentication & Security

**Authentication Approach:**  
- Basic email/password authentication  
- Authenticated routes checked with user ID match  
- Use of localStorage for keeping login state (for development only)  
- Minimal sensitive data stored (only email and password for login)  

**Security Considerations:**  
- No sensitive or financial information is collected.  
- Passwords will only be handled in development with basic logic.  

---

## Stretch Goals & Reflection

**Stretch Goals:**  
- Ingredient Suggestions: Suggest commonly avoided ingredients based on breed or popularity.  
- Notifications: Notify users when new products match their dog’s restrictions.  
- Interactive Dashboard: Personalized dashboard showing saved favorites, new safe items, and recent reviews.  
- Multi-language Support: Allow the site to eventually support languages beyond English.  
- Admin Tools: Basic admin panel to approve product submissions or review flagged content.  

**Reflection & Learning Goals:**  
Through this project, I want to reinforce the skills I’ve learned so far in my program. My goals include:  
- Strengthening my understanding of full-stack development using the MERN stack  
- Practicing breaking down large projects into milestones and tasks  
- Becoming more comfortable with connecting frontend and backend components  
- Learning how to integrate APIs and work with structured data  
- Building a useful and personal tool I can be proud of  

---

## Milestones, Timeline & Risks

**Project Timeline (6 Weeks):**  

- **Week 1:** Finalize proposal, GitHub repo, Kanban board, set up Vite + React frontend, Express backend, MongoDB models  
- **Week 2:** Add authentication, user and dog profile forms/routes, begin custom API with mock data  
- **Week 3:** Build product listing/detail views, add ingredient filtering, dog-specific restrictions, start styling  
- **Week 4:** Add favorites, ratings, reviews, product search, connect frontend + backend  
- **Week 5:** Finalize filter system, pagination, automate data updates, polish UI, fix bugs  
- **Week 6:** Testing, final feature checks, prepare for Capstone submission  

**Risks & Resolutions:**  
- Risk: Limited access to clean product data → Solution: use free APIs; build custom API  
- Risk: Data becoming outdated → Solution: scheduled backend refresh (cron job)  
- Risk: Time constraints → Solution: stick to milestones, prioritize rubric-required features  
- Risk: Feature creep → Solution: log future ideas but delay until after launch  

---

## Conclusion

Pup Pantry was born from a personal need—to make it easier and safer to shop for my own dog. Through this project, I aim to create a tool that helps dog owners quickly filter out harmful ingredients and discover better food and treat options. This app will combine everything I’ve learned so far in the program: React with Vite for the frontend, Node.js and Express for the backend, and MongoDB for the database.

By focusing on a clean user experience, real-world functionality, and manageable development scope, I believe Pup Pantry will not only meet the Capstone requirements but also serve as a meaningful portfolio piece. I’m excited to build something that matters to me and could benefit many other pet owners like myself.

---

## Step 3: Frontend Control Flow

The frontend flow diagram shows the planned navigation between main pages and key user actions in Pup Pantry.  
You can view the diagrams here:  
**Frontend Flow Folder**

---

## Step 4: Database Model

The database model defines how Pup Pantry will store and organize data.  

### Diagram  
![Database Model](Database%20Model/Untitled%20diagram%20_%20Mermaid%20Chart-2025-09-26-181723.svg)  

### Collections  
- **Users** – account info, preferences, and authentication.  
- **Dogs** – belongs to users; holds ingredient restrictions.  
- **Ingredients** – canonical list of ingredients, with synonyms.  
- **Brands** – manufacturers or product lines.  
- **Products** – food, treats, chews, supplements, cleaners. Contains ingredient references.  
- **Stores** – online or physical retailers.  
- **Inventory** – per-store availability, price, and product links.  
- **Reviews** – ratings and comments by users on products.  
- **Favorites** – user-saved products list.  

### Relationships  
- One user → many dogs, reviews, favorites.  
- One dog → many ingredient restrictions.  
- One product → many reviews and inventory records.  
- One brand → many products.  
- One store → many inventory records.  
- Many-to-many: products ↔ ingredients.  
- Many-to-many: dogs ↔ ingredients (restrictions).  

### Possible Challenges / Shortcomings  
- Ingredient synonyms may need normalization (e.g., “NaCl” vs “Salt”).  
- Store prices update frequently → requires automated syncing.  
- Favorites can be embedded or separate; trade-offs in performance.  
- Queries must balance global user preferences vs per-dog restrictions.  
- Large ingredient lists → need indexing for fast filtering.  
