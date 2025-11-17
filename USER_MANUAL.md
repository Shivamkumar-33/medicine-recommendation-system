# MedRec Safe-X - Complete User Manual

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation Guide](#installation-guide)
4. [Environment Configuration](#environment-configuration)
5. [Supabase Setup](#supabase-setup)
6. [Running the Project](#running-the-project)
7. [Application Features](#application-features)
8. [Troubleshooting](#troubleshooting)
9. [Deployment](#deployment)

---

## Introduction

MedRec Safe-X is a comprehensive medical records management application that helps users track their health data, manage medications, schedule appointments, and analyze health symptoms. This manual provides complete step-by-step instructions to set up and run the project.

**Key Features:**
- Disease prediction based on symptoms
- Medication safety checking
- Medical records management
- Appointment scheduling
- Health vitals tracking
- Lab results storage
- Family history tracking
- Emergency contacts management
- AI chat assistant
- PDF report generation

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (Version 18.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```
   - **Screenshot**: [Screenshot of Node.js version check in terminal]

2. **npm** (comes with Node.js) or **bun** (alternative package manager)
   - Verify npm:
     ```bash
     npm --version
     ```
   - **Screenshot**: [Screenshot showing npm version]

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation:
     ```bash
     git --version
     ```
   - **Screenshot**: [Screenshot of Git version check]

4. **Code Editor** (Recommended: Visual Studio Code)
   - Download from: https://code.visualstudio.com/
   - **Screenshot**: [Screenshot of VS Code welcome screen]

5. **Supabase Account** (Free tier available)
   - Sign up at: https://supabase.com/
   - **Screenshot**: [Screenshot of Supabase sign-up page]

---

## Installation Guide

### Step 1: Clone the Repository

1. Open your terminal (Command Prompt, PowerShell, or Git Bash on Windows; Terminal on Mac/Linux)

2. Navigate to the directory where you want to store the project:
   ```bash
   cd C:\Users\YourUsername\Projects
   ```
   - **Screenshot**: [Screenshot showing terminal with cd command]

3. Clone the repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   ```
   Or if you have the ZIP file:
   - Extract the ZIP file to your desired location
   - **Screenshot**: [Screenshot of extracted folder structure]

4. Navigate into the project directory:
   ```bash
   cd medrec-safe-x-main\medrec-safe-x-main
   ```
   - **Screenshot**: [Screenshot showing project directory in terminal]

---

### Step 2: Install Dependencies

1. Open your terminal in the project root directory

2. Install all required dependencies:
   ```bash
   npm install
   ```
   - This will install all packages listed in `package.json`
   - Wait for the installation to complete (this may take 2-5 minutes)
   - **Screenshot**: [Screenshot of npm install in progress showing package downloads]
   - **Screenshot**: [Screenshot showing "added X packages" success message]

3. Verify installation by checking `node_modules` folder exists:
   - **Screenshot**: [Screenshot of project folder showing node_modules directory]

**Expected Output:**
```
added 1234 packages, and audited 1235 packages in 2m
```

---

## Environment Configuration

### Step 1: Create Environment File

1. In the project root directory, create a new file named `.env`

2. **Screenshot**: [Screenshot showing .env file creation in VS Code]

3. Add the following content to `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Screenshot**: [Screenshot of .env file with placeholder values]

**Important Notes:**
- Never commit the `.env` file to version control
- Keep your Supabase keys secure
- The `.env` file should be in the root directory (same level as `package.json`)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to https://supabase.com/ and sign in (or create an account)

2. Click **"New Project"** button
   - **Screenshot**: [Screenshot of Supabase dashboard with "New Project" button]

3. Fill in the project details:
   - **Project Name**: `medrec-safe-x` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select the region closest to you
   - **Pricing Plan**: Select "Free" tier
   - **Screenshot**: [Screenshot of Supabase project creation form]

4. Click **"Create new project"** and wait for setup (2-3 minutes)
   - **Screenshot**: [Screenshot showing project setup progress]

---

### Step 2: Get Supabase Credentials

1. Once your project is created, go to **Settings** → **API**
   - **Screenshot**: [Screenshot showing Supabase project settings menu]

2. Find the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **Screenshot**: [Screenshot showing Supabase API settings with URL and keys highlighted]

3. Copy these values

---

### Step 3: Update Environment File

1. Open your `.env` file in the project

2. Replace the placeholders with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - **Screenshot**: [Screenshot of .env file with actual values (blurred for security)]

3. Save the file (Ctrl+S or Cmd+S)

---

### Step 4: Run Database Migrations

1. In Supabase, go to **SQL Editor** in the left sidebar
   - **Screenshot**: [Screenshot showing Supabase SQL Editor menu]

2. Click **"New query"** button
   - **Screenshot**: [Screenshot showing SQL Editor with "New query" button]

3. Open the migration file from your project:
   - Navigate to: `supabase/migrations/20250101000000_add_all_features.sql`
   - Copy the entire contents of this file
   - **Screenshot**: [Screenshot showing the migration SQL file open in VS Code]

4. Paste the SQL into the Supabase SQL Editor
   - **Screenshot**: [Screenshot showing SQL pasted in Supabase SQL Editor]

5. Click **"Run"** button (or press Ctrl+Enter)
   - **Screenshot**: [Screenshot showing SQL execution with success message]

6. Verify the tables were created:
   - Go to **Table Editor** in Supabase
   - You should see multiple tables: `medication_reminders`, `family_history`, `lab_results`, etc.
   - **Screenshot**: [Screenshot showing Supabase Table Editor with all tables listed]

7. (Optional) Run the second migration:
   - Open: `supabase/migrations/20251112091849_6c7eb61b-bd81-4226-a617-58c551564bde.sql`
   - Copy and run it in the SQL Editor if it exists

---

### Step 5: Configure Authentication

1. In Supabase, go to **Authentication** → **Providers**
   - **Screenshot**: [Screenshot showing Authentication menu]

2. Enable **Email** provider (should be enabled by default)
   - Configure email templates if needed
   - **Screenshot**: [Screenshot showing Email provider settings]

3. (Optional) Enable other providers like Google, GitHub, etc.
   - **Screenshot**: [Screenshot showing provider configuration options]

---

## Running the Project

### Step 1: Start the Development Server

1. Open your terminal in the project root directory

2. Run the development server:
   ```bash
   npm run dev
   ```
   - **Screenshot**: [Screenshot showing npm run dev command]

3. Wait for the server to start. You should see output like:
   ```
   VITE v5.x.x  ready in 500 ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: http://192.168.x.x:8080/
   ```
   - **Screenshot**: [Screenshot showing Vite dev server output]

---

### Step 2: Access the Application

1. Open your web browser (Chrome, Firefox, Edge, or Safari)

2. Navigate to: `http://localhost:8080`
   - **Screenshot**: [Screenshot of browser address bar showing localhost:8080]

3. You should see the MedRec Safe-X homepage
   - **Screenshot**: [Screenshot of the application homepage]

---

### Step 3: Verify Everything is Working

1. **Check for Errors:**
   - Open browser DevTools (F12)
   - Check the Console tab for any errors
   - **Screenshot**: [Screenshot showing browser console with no errors]

2. **Test Authentication:**
   - Click "Sign In" button
   - Try creating an account or signing in
   - **Screenshot**: [Screenshot of the authentication page]

3. **Test Main Features:**
   - Fill out the prediction form
   - Check if results display correctly
   - **Screenshot**: [Screenshot showing prediction results]

---

## Application Features

### Main Features Overview

#### 1. Disease Prediction
- **Location**: Homepage
- **How to use**:
  1. Enter your symptoms
  2. Add any allergies
  3. List current medications
  4. Click "Analyze"
  5. View predicted conditions
  6. Check medication safety analysis
  7. **Screenshot**: [Screenshot of prediction form and results]

#### 2. Document Analyzer
- **Location**: Homepage (below prediction form)
- **How to use**:
  1. Paste medical document text
  2. Click "Analyze Document"
  3. View extracted information
  4. **Screenshot**: [Screenshot of document analyzer]

#### 3. Dashboard
- **Access**: Click "My History" when signed in
- **Features**: View assessment history
- **Screenshot**: [Screenshot of dashboard page]

#### 4. Features Page
- **Access**: Click "Features" button in navigation
- **Features Include**:
  - Medication Reminders
  - Family History
  - Lab Results
  - Emergency Contacts
  - Health Vitals
  - Appointments
  - Health Goals
  - AI Chat Assistant
  - Notifications
  - **Screenshot**: [Screenshot of features page with tabs]

---

### Detailed Feature Usage

#### Medication Reminders
1. Go to **Features** → **Medication Reminders** tab
2. Click **"Add Reminder"**
3. Fill in:
   - Medication name
   - Dosage
   - Frequency
   - Reminder times
   - Start date
4. Click **"Save"**
5. **Screenshot**: [Screenshot of medication reminder form]

#### Family History
1. Go to **Features** → **Family History** tab
2. Click **"Add Family History"**
3. Enter:
   - Relation (mother, father, sibling, etc.)
   - Condition name
   - Age at diagnosis (optional)
   - Notes (optional)
4. Click **"Save"**
5. **Screenshot**: [Screenshot of family history form]

#### Lab Results
1. Go to **Features** → **Lab Results** tab
2. Click **"Add Lab Result"**
3. Enter:
   - Test name
   - Test date
   - Results (JSON or text)
   - Doctor name (optional)
   - Lab name (optional)
   - Notes (optional)
4. Click **"Save"**
5. **Screenshot**: [Screenshot of lab results form]

#### Emergency Contacts
1. Go to **Features** → **Emergency Contacts** tab
2. Click **"Add Contact"**
3. Fill in:
   - Name
   - Relationship
   - Phone number
   - Email (optional)
   - Mark as primary (optional)
   - Notes (optional)
4. Click **"Save"**
5. **Screenshot**: [Screenshot of emergency contacts form]

#### Health Vitals
1. Go to **Features** → **Health Vitals** tab
2. Click **"Add Vital"**
3. Select vital type:
   - Blood Pressure
   - Heart Rate
   - Temperature
   - Weight
   - Blood Sugar
   - O2 Saturation
4. Enter value and date/time
5. Add notes (optional)
6. Click **"Save"**
7. View charts showing trends
8. **Screenshot**: [Screenshot of health vitals with charts]

#### Appointments
1. Go to **Features** → **Appointments** tab
2. Click **"Schedule Appointment"**
3. Enter:
   - Doctor name
   - Specialty
   - Date and time
   - Location
   - Notes (optional)
4. Click **"Save"**
5. View upcoming vs past appointments
6. **Screenshot**: [Screenshot of appointments calendar view]

#### Health Goals
1. Go to **Features** → **Health Goals** tab
2. Click **"Add Goal"**
3. Enter:
   - Goal type
   - Current value
   - Target value
   - Target date
   - Notes (optional)
4. Click **"Save"**
5. Track progress with visual progress bars
6. **Screenshot**: [Screenshot of health goals with progress bars]

#### AI Chat Assistant
1. Go to **Features** → **AI Chat Assistant** tab
2. Type your health-related question
3. Click **"Send"** or press Enter
4. View AI response
5. Use quick question suggestions
6. **Screenshot**: [Screenshot of AI chat interface]

#### Notifications
1. Go to **Features** → **Notifications** tab (or click notification bell icon)
2. View all notifications
3. Mark as read/unread
4. Delete notifications
5. **Screenshot**: [Screenshot of notifications panel]

---

### PDF Report Generation

1. After completing a prediction analysis, click **"Download Report"**
2. Browser print dialog will open
3. Select "Save as PDF" as destination
4. Click **"Save"**
5. **Screenshot**: [Screenshot showing PDF download process]

---

### Sharing Reports

1. After analysis, click **"Share"** button
2. Choose sharing method:
   - Native share (mobile/desktop)
   - Copy to clipboard
3. **Screenshot**: [Screenshot of share options]

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "npm install" Fails

**Symptoms:**
- Error messages during package installation
- Missing dependencies

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` folder and `package-lock.json`
3. Run `npm install` again
4. **Screenshot**: [Screenshot showing cache clean command]

---

#### Issue 2: "Cannot connect to Supabase"

**Symptoms:**
- Authentication errors
- API request failures
- Blank data

**Solutions:**
1. Verify `.env` file exists and has correct values
2. Check Supabase project is active (not paused)
3. Verify API keys are correct in Supabase dashboard
4. Check browser console for specific error messages
5. **Screenshot**: [Screenshot showing environment variables check]

---

#### Issue 3: "Port 8080 is already in use"

**Symptoms:**
- Error: `Port 8080 is already in use`

**Solutions:**
1. Find and stop the process using port 8080:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:8080 | xargs kill
   ```
2. Or change the port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3000,  // Change to any available port
   }
   ```
3. **Screenshot**: [Screenshot showing port configuration]

---

#### Issue 4: "Module not found" Errors

**Symptoms:**
- Import errors in console
- Missing module warnings

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Restart the dev server
4. **Screenshot**: [Screenshot of reinstallation process]

---

#### Issue 5: Database Tables Not Found

**Symptoms:**
- Features page shows errors
- "Table does not exist" errors

**Solutions:**
1. Verify migrations ran successfully in Supabase
2. Re-run migration SQL in Supabase SQL Editor
3. Check Table Editor to confirm tables exist
4. **Screenshot**: [Screenshot showing Supabase table verification]

---

#### Issue 6: Authentication Not Working

**Symptoms:**
- Cannot sign in/sign up
- "Invalid credentials" errors

**Solutions:**
1. Check Supabase Authentication settings
2. Verify email provider is enabled
3. Check email confirmation requirements
4. Review browser console for errors
5. **Screenshot**: [Screenshot of Supabase auth settings]

---

#### Issue 7: Build Errors

**Symptoms:**
- TypeScript errors
- Build fails

**Solutions:**
1. Check TypeScript version compatibility
2. Run type checking:
   ```bash
   npx tsc --noEmit
   ```
3. Review error messages in terminal
4. **Screenshot**: [Screenshot showing TypeScript errors]

---

### Getting Help

1. **Check Browser Console:**
   - Press F12 to open DevTools
   - Review Console tab for errors
   - Review Network tab for failed requests

2. **Check Terminal Output:**
   - Review error messages in terminal
   - Look for specific file/line references

3. **Verify Configuration:**
   - Environment variables
   - Supabase credentials
   - Database migrations

4. **Common Resources:**
   - Vite documentation: https://vitejs.dev/
   - Supabase documentation: https://supabase.com/docs
   - React documentation: https://react.dev/

---

## Deployment

### Building for Production

1. Create production build:
   ```bash
   npm run build
   ```
   - **Screenshot**: [Screenshot showing build process]

2. Build output will be in `dist/` folder
   - **Screenshot**: [Screenshot of dist folder contents]

---

### Deployment Options

#### Option 1: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard
4. **Screenshot**: [Screenshot of Vercel deployment]

---

#### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Configure environment variables
4. **Screenshot**: [Screenshot of Netlify deployment]

---

#### Option 3: Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `package.json` scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```

3. Deploy:
   ```bash
   npm run build
   npm run deploy
   ```

4. **Screenshot**: [Screenshot of GitHub Pages deployment]

---

### Environment Variables in Production

1. Add environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Important**: These must match your Supabase project

3. **Screenshot**: [Screenshot showing environment variables in hosting dashboard]

---

## Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### File Structure Overview

```
medrec-safe-x-main/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── integrations/   # Supabase client
│   └── lib/            # Shared libraries
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
├── .env                # Environment variables (create this)
├── package.json        # Dependencies
└── vite.config.ts      # Vite configuration
```

### Important URLs

- **Development**: http://localhost:8080
- **Supabase Dashboard**: https://app.supabase.com/
- **Supabase Documentation**: https://supabase.com/docs

---

## Additional Resources

### Project Links
- Repository: [Your Repository URL]
- Documentation: [Documentation URL]
- Issue Tracker: [Issues URL]

### Learning Resources
- React Documentation: https://react.dev/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase Guide: https://supabase.com/docs/guides

---

## Support and Contact

If you encounter issues not covered in this manual:

1. Check the troubleshooting section
2. Review error messages in console
3. Consult project documentation
4. Open an issue in the repository

---

## Appendix

### Screenshot Locations

All screenshots referenced in this manual should be placed in a `screenshots/` folder within the project directory:

```
screenshots/
├── 01-node-version.png
├── 02-npm-install.png
├── 03-project-structure.png
├── 04-env-file.png
├── 05-supabase-dashboard.png
├── 06-supabase-api-settings.png
├── 07-sql-editor.png
├── 08-dev-server-running.png
├── 09-homepage.png
├── 10-auth-page.png
├── 11-prediction-form.png
├── 12-results-display.png
├── 13-features-page.png
├── 14-medication-reminders.png
├── 15-family-history.png
├── 16-lab-results.png
├── 17-emergency-contacts.png
├── 18-health-vitals.png
├── 19-appointments.png
├── 20-health-goals.png
├── 21-ai-chat.png
├── 22-notifications.png
├── 23-pdf-download.png
└── 24-share-options.png
```

**Note:** When taking screenshots:
- Use clear, high-resolution images
- Ensure text is readable
- Crop unnecessary areas
- Name files descriptively
- Consider privacy (blur sensitive information like API keys)
- Use consistent naming convention
- Format: PNG or JPG

### Checklist

Use this checklist when setting up:

- [ ] Node.js and npm installed
- [ ] Repository cloned/extracted
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Development server running
- [ ] Application accessible in browser
- [ ] Authentication working
- [ ] Features tested

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Project:** MedRec Safe-X

---

*This manual is intended to provide comprehensive guidance for setting up and running the MedRec Safe-X application. For additional support, please refer to the project documentation or open an issue.*

