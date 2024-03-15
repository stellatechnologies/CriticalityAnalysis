import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_pdf_report(data, filename="bandit_report.pdf"):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Title and Headers
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "Bandit Report")
    c.setFont("Helvetica", 12)
    c.drawString(72, height - 90, f"Generated at: {data['generated_at']}")
    
    # Starting Y position
    y_position = height - 120
    
    # Metrics Summary
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, y_position, "Metrics Summary:")
    y_position -= 18
    c.setFont("Helvetica", 12)
    for file, metrics in data['metrics'].items():
        if file != "_totals":
            c.drawString(72, y_position, f"{file}:")
            y_position -= 14
            for key, value in metrics.items():
                c.drawString(82, y_position, f"{key}: {value}")
                y_position -= 14
        if y_position < 100:  # Check for new page
            c.showPage()
            y_position = height - 72
            c.setFont("Helvetica", 12)
    
    # Check if we need a new page for results
    if y_position < 200:
        c.showPage()
        y_position = height - 72
    
    # Results
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, y_position, "Results:")
    y_position -= 18
    
    for result in data['results']:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(72, y_position, f"Issue in {result['filename']} (line {result['line_number']}):")
        y_position -= 14
        c.setFont("Helvetica", 12)
        c.drawString(82, y_position, f"Severity: {result['issue_severity']}, Confidence: {result['issue_confidence']}")
        y_position -= 14
        c.drawString(82, y_position, f"Description: {result['issue_text']}")
        y_position -= 14
        c.drawString(82, y_position, f"More Info: {result['more_info']}")
        y_position -= 20
        
        if y_position < 100:  # Check for new page
            c.showPage()
            y_position = height - 72

    c.save()

# Load JSON data
with open('banditReport.json', 'r') as file:
    data = json.load(file)

generate_pdf_report(data)
