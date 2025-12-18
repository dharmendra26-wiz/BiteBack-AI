# Vesta-AI 
AI-Powered Surplus Food Rescue Platform

## The Problem
Small local bakeries, cafes, and grocery stores often have high-quality surplus food at the end of the day that goes to waste because they don't have the time to market it or find charities. Meanwhile, budget-conscious students or local residents are looking for affordable meals, and food banks need real-time alerts for donations.

## The Solution: "Vesta AI"
BiteBack is a platform that uses AI to predict surplus levels for businesses and automates the connection between businesses, customers, and food banks.

### 1. Key Features
- **AI Dynamic Pricing**: A "Smart Markdown" system that uses AI to suggest the best price for surplus items based on the time of day, item type, and historical sales.
- **AI Inventory Scanner**: A feature where a shop owner takes a photo of their leftover shelf, and AI (via Gemini or Vision API) automatically identifies the items and populates the "Surplus List."
- **Smart Matching**: An algorithm that notifies local food banks only when the surplus matches their specific dietary needs (e.g., "High Protein" or "Vegetarian").
- **Impact Dashboard**: Visualizes how much CO2 was saved by preventing waste.

### 2. Technical Architecture
| **Layer**       | **Technology**             | **Responsibility**                                                           |
|------------------|----------------------------|------------------------------------------------------------------------------|
| Frontend        | HTML5, CSS3, JavaScript    | UI/UX, Camera integration for photo uploads, Real-time notifications.       |
| Backend         | Spring Boot (Java 17+)     | REST APIs, Security (JWT), Business Logic, Database Management.             |
| Database        | MySQL                      | Storing User profiles, Inventory, and Transaction history.                  |
| AI Integration  | Spring AI + OpenAI         | Image recognition (surplus items) and Price optimization models.             |
| Messaging       | WebSockets                 | Real-time alerts when a new "Surplus Bag" is posted.                        |

---
## Let's collaborate!
We welcome contributions from developers, designers, and anyone interested in reducing food waste. Feel free to fork the repository, open issues, or submit pull requests to make BiteBack even better!
