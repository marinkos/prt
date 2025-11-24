// Code samples for different languages
const codeSamples = {
    'JavaScript (Node.js)': `import fs from "fs";
  
  const formData = new FormData();
  formData.append("video", fs.createReadStream("/path/to/input.mp4"));
  formData.append(
    "prompt",
    \`Replace the human with a bipedal tiger-like humanoid. It has orange-and-black striped fur, a powerful upright stance, muscular arms, and a focused feline gaze\`
  );
  
  const response = await fetch("https://cdn.api.decart.ai/vid2vid/process", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.DECART_API_KEY,
    },
    body: formData
  });`,
  
    'Python': `import requests
  import os
  
  files = {'video': open('/path/to/input.mp4', 'rb')}
  data = {
      'prompt': 'Replace the human with a bipedal tiger-like humanoid. It has orange-and-black striped fur, a powerful upright stance, muscular arms, and a focused feline gaze'
  }
  headers = {
      'X-API-KEY': os.environ.get('DECART_API_KEY')
  }
  
  response = requests.post(
      'https://cdn.api.decart.ai/vid2vid/process',
      files=files,
      data=data,
      headers=headers
  )`,
  
    'TypeScript': `import fs from "fs";
  import fetch from "node-fetch";
  import FormData from "form-data";
  
  const formData = new FormData();
  formData.append("video", fs.createReadStream("/path/to/input.mp4"));
  formData.append(
    "prompt",
    "Replace the human with a bipedal tiger-like humanoid. It has orange-and-black striped fur, a powerful upright stance, muscular arms, and a focused feline gaze"
  );
  
  const response: Response = await fetch("https://cdn.api.decart.ai/vid2vid/process", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.DECART_API_KEY as string,
    },
    body: formData
  });`,
  
    'cURL': `curl -X POST https://cdn.api.decart.ai/vid2vid/process \\
    -H "X-API-KEY: $DECART_API_KEY" \\
    -F "video=@/path/to/input.mp4" \\
    -F "prompt=Replace the human with a bipedal tiger-like humanoid. It has orange-and-black striped fur, a powerful upright stance, muscular arms, and a focused feline gaze"`
  };
  
  // Simple syntax highlighting function
  function highlightCode(code, language) {
    // Keywords for different languages
    const keywords = {
      'JavaScript (Node.js)': ['import', 'from', 'const', 'await', 'fetch', 'new', 'method', 'headers', 'body', 'append'],
      'Python': ['import', 'def', 'class', 'if', 'else', 'for', 'while', 'return', 'try', 'except', 'with', 'as'],
      'TypeScript': ['import', 'from', 'const', 'await', 'fetch', 'new', 'method', 'headers', 'body', 'append', 'interface', 'type'],
      'cURL': ['curl', '-X', '-H', '-F', 'POST', 'GET']
    };
  
    let highlightedCode = code;
  
    // Escape HTML
    highlightedCode = highlightedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  
    // Highlight strings
    highlightedCode = highlightedCode.replace(
      /("[^"]*"|'[^']*'|`[^`]*`)/g,
      '<span style="color: #22c55e;">$1</span>'
    );
  
    // Highlight comments
    if (language === 'Python') {
      highlightedCode = highlightedCode.replace(
        /(#.*$)/gm,
        '<span style="color: #6b7280;">$1</span>'
      );
    } else if (language !== 'cURL') {
      highlightedCode = highlightedCode.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        '<span style="color: #6b7280;">$1</span>'
      );
    }
  
    // Highlight keywords
    if (keywords[language]) {
      keywords[language].forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        highlightedCode = highlightedCode.replace(
          regex,
          '<span style="color: #3b82f6; font-weight: bold;">$1</span>'
        );
      });
    }
  
    // Highlight URLs
    highlightedCode = highlightedCode.replace(
      /(https?:\/\/[^\s"']+)/g,
      '<span style="color: #8b5cf6;">$1</span>'
    );
  
    // Highlight environment variables
    highlightedCode = highlightedCode.replace(
      /(\$\w+|process\.env\.\w+)/g,
      '<span style="color: #f59e0b;">$1</span>'
    );
  
    return highlightedCode;
  }
  
  // Function to update code display
  function updateCodeDisplay(language) {
    const codeTextElement = document.getElementById('codeText');
    const rawCode = codeSamples[language] || codeSamples['JavaScript (Node.js)'];
    const highlightedCode = highlightCode(rawCode, language);
    
    // Convert newlines to <br> tags and preserve indentation with &nbsp;
    const formattedCode = highlightedCode
      .split('\n')
      .map(line => {
        // Replace all leading spaces with &nbsp; to preserve indentation
        const leadingSpaces = line.match(/^(\s+)/);
        if (leadingSpaces) {
          const spaceCount = leadingSpaces[1].length;
          return '&nbsp;'.repeat(spaceCount) + line.substring(spaceCount);
        }
        return line;
      })
      .join('<br>');
    
    codeTextElement.innerHTML = formattedCode;
  }
  
  // Function to copy code to clipboard
  async function copyCodeToClipboard() {
    const codeSelect = document.getElementById('codeSelect');
    const selectedLanguage = codeSelect.value;
    const rawCode = codeSamples[selectedLanguage] || codeSamples['JavaScript (Node.js)'];
    
    // Get icon elements
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');
    
    try {
      await navigator.clipboard.writeText(rawCode);
      
      // Switch icons
      if (copyIcon) copyIcon.style.display = 'none';
      if (checkIcon) checkIcon.style.display = 'block';
      
      // Switch back after 2 seconds
      setTimeout(() => {
        if (copyIcon) copyIcon.style.display = 'block';
        if (checkIcon) checkIcon.style.display = 'none';
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy code: ', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = rawCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Switch icons even with fallback
        if (copyIcon) copyIcon.style.display = 'none';
        if (checkIcon) checkIcon.style.display = 'block';
        
        // Switch back after 2 seconds
        setTimeout(() => {
          if (copyIcon) copyIcon.style.display = 'block';
          if (checkIcon) checkIcon.style.display = 'none';
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed: ', fallbackErr);
      }
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    const codeSelect = document.getElementById('codeSelect');
    const codeCopy = document.getElementById('codeCopy');
    const checkIcon = document.getElementById('checkIcon');
    
    // Hide check icon initially
    if (checkIcon) {
      checkIcon.style.display = 'none';
    }
    
    // Set default code display
    updateCodeDisplay('JavaScript (Node.js)');
    
    // Add event listener for dropdown change
    if (codeSelect) {
      codeSelect.addEventListener('change', function() {
        updateCodeDisplay(this.value);
      });
    }
    
    // Add event listener for copy button
    if (codeCopy) {
      codeCopy.addEventListener('click', copyCodeToClipboard);
    }
  });