# Resume Information Extraction

A powerful Resume Parser and Validator built with **Next.js 16**, **React 19**, and **TypeScript**. This application allows users to upload resumes (PDF, TXT) to automatically extract key information such as contact details, skills, work experience, education, and projects.

## 🚀 Features

- **Drag & Drop Upload**: Easily upload resumes in PDF or TXT formats.
- **Intelligent Extraction**: Automatically parses and extracts:
  - **Contact Information**: Name, Email, Phone, Location, LinkedIn, GitHub.
  - **Skills**: Identifies technical skills from a comprehensive list.
  - **Experience**: Extracts job titles, companies, durations, and descriptions.
  - **Education**: Captures degrees, institutions, and graduation years.
  - **Projects**: Identifies project titles, descriptions, and technologies used.
- **Data Validation**: Validates extracted data and provides warnings for missing critical fields (e.g., email, phone).
- **Interactive Editing**: Users can review and edit the extracted information directly in the UI.
- **Modern UI/UX**: Built with **Tailwind CSS v4** and **Radix UI** for a responsive and accessible design.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **PDF Processing**: [unpdf](https://github.com/unjs/unpdf)

## 📦 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ShivaprakashDM/resume-Information-Gathering.git
    cd resume-Information-Gathering
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── api/parse-resume/ # API route for resume parsing logic
│   ├── page.tsx          # Main homepage component
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/               # Reusable UI components (buttons, inputs, etc.)
│   ├── resume-uploader.tsx # Component for file upload
│   └── extracted-data.tsx  # Component to display and edit results
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/               # Global styles
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
