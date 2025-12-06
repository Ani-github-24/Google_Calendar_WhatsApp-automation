# 📅 WhatsApp to Calendar Automation

![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)
![Google Apps Script](https://img.shields.io/badge/Cloud-Apps%20Script-green)
![Status](https://img.shields.io/badge/Status-Prototype-orange)

An automation bridge that intercepts WhatsApp assignment notifications and auto-schedules them in Google Calendar using **Gemini AI** for deadline extraction.

## 🏗 Architecture

```mermaid
graph LR
    A[Phone Notification<br>WhatsApp] -->|MacroDroid| B(Secure Webhook<br>POST Request)
    B --> C{Google Apps Script}
    C -->|Authenticate| D[Check Secret Token]
    D -->|Valid| E[Gemini 1.5 Flash API]
    E -->|Extract Date & Summary| F[(Google Calendar)]
    E -->|Log Data| G[(Google Sheets)]
