import React, { useState, useEffect, useRef } from 'react';
import { UseAppStateReturnType } from '../hooks/useAppState';
import { showToast } from '../components/Toast';
import './SitecoreCMSView.css';

// Type definitions for Sitecore CMS component instances
export interface RenderingInstance {
  id: string;
  type: string;
  placeholder: 'header' | 'main' | 'footer';
  properties: Record<string, any>;
}

// Predefined available component types in the Sitecore Toolbox
interface ToolboxItem {
  type: string;
  name: string;
  icon: string;
  category: 'Structure' | 'Hero & Headers' | 'Page Content' | 'Interactive Elements';
  defaultProps: Record<string, any>;
}

const TOOLBOX_ITEMS: ToolboxItem[] = [
  {
    type: 'hero',
    name: 'Hero Banner',
    icon: '🚀',
    category: 'Hero & Headers',
    defaultProps: {
      title: 'Accelerate Your DevOps Career',
      subtitle: 'Build real-world infrastructure, master CI/CD pipelines, and land a high-paying DevOps role in 90 days.',
      btn1Text: 'View Roadmap',
      btn1Color: '#00d9a0',
      btn2Text: 'Start Quiz',
      bgGradStart: '#0d1117',
      bgGradEnd: '#141b26',
      align: 'center',
      padding: 'large',
      borderRadius: 'standard',
    }
  },
  {
    type: 'cta',
    name: 'Call to Action',
    icon: '⚡',
    category: 'Hero & Headers',
    defaultProps: {
      title: 'Ready to benchmark your readiness?',
      subtitle: 'Take our simulated readiness check based on real-world hiring standards.',
      btnText: 'Start Assessment',
      align: 'center',
      bgGradStart: '#141b26',
      bgGradEnd: '#1c2436',
      padding: 'medium',
      borderRadius: 'standard',
    }
  },
  {
    type: 'text',
    name: 'Rich Text Block',
    icon: '📝',
    category: 'Page Content',
    defaultProps: {
      title: 'Why Practice DevOps Visually?',
      body: 'Modern cloud infrastructure is complex. Drag-and-drop orchestration combined with active recall quizzes builds deep intuition faster than passive video watching. This interactive CMS helps you model layouts.',
      align: 'left',
      padding: 'medium',
      borderRadius: 'standard',
      bgGradStart: 'transparent',
      bgGradEnd: 'transparent',
    }
  },
  {
    type: 'features',
    name: 'Feature Grid',
    icon: '⊞',
    category: 'Page Content',
    defaultProps: {
      title: 'Roadmap Core Pillars',
      item1Icon: '🐋',
      item1Title: 'Docker & Kubernetes',
      item1Desc: 'Containerize apps and run massive scale orchestration.',
      item2Icon: '🤖',
      item2Title: 'CI/CD Pipelines',
      item2Desc: 'Automate testing, building, and deployment cycles.',
      item3Icon: '☁️',
      item3Title: 'Infrastructure as Code',
      item3Desc: 'Provision Cloud infrastructure using Terraform.',
      bgGradStart: 'transparent',
      bgGradEnd: 'transparent',
      padding: 'medium',
    }
  },
  {
    type: 'terminal',
    name: 'DevOps Terminal',
    icon: '💻',
    category: 'Interactive Elements',
    defaultProps: {
      title: 'deploy-agent.sh',
      output: '$ npm install -g devops-roadmap-agent\n$ devops-agent init --roadmap-version=v4\n[+] Initializing environment...\n[+] Provisioning local docker registry...\n[+] Setup completed successfully. Ready for labs!',
      bgGradStart: '#000000',
      bgGradEnd: '#000000',
      padding: 'small',
    }
  },
  {
    type: 'quiz',
    name: 'Study Quiz',
    icon: '❓',
    category: 'Interactive Elements',
    defaultProps: {
      question: 'Which tool is primarily used for Infrastructure as Code (IaC)?',
      opt1: 'Terraform (Recommended)',
      opt2: 'Jenkins',
      opt3: 'Docker',
      opt4: 'Git',
      explanation: 'Terraform allows you to define and provision cloud infrastructure using code.',
      bgGradStart: '#0d1117',
      bgGradEnd: '#141b26',
    }
  },
  {
    type: 'project',
    name: 'Project Showcase',
    icon: '📂',
    category: 'Interactive Elements',
    defaultProps: {
      title: 'Visual Git Analyzer',
      badge: 'Completed',
      desc: 'Build a React dashboard displaying commit frequency, build logs, and test success rates from your github repositories.',
      tag1: 'React',
      tag2: 'GitHub API',
      tag3: 'Vite',
      bgGradStart: '#0d1117',
      bgGradEnd: '#0d1117',
    }
  },
  {
    type: 'testimonial',
    name: 'Testimonial Card',
    icon: '💬',
    category: 'Page Content',
    defaultProps: {
      quote: 'The visual approach of the DevOps Roadmap changed how I studied. Moving cards in Kanban and visual tools prepared me exactly for my interviews!',
      author: 'Karthik G.',
      role: 'DevOps Engineer at CloudScale',
      avatar: 'KG',
    }
  },
  {
    type: 'divider',
    name: 'Section Divider',
    icon: '➖',
    category: 'Structure',
    defaultProps: {
      iconSymbol: '◆',
      color: '#222d42',
    }
  }
];

// Local storage key for custom layouts
const STORAGE_KEY_LAYOUT = 'sitecore_cms_layout_v4';

// Default layout preset matching DevOps roadmap landing page
const DEFAULT_LAYOUT: RenderingInstance[] = [
  {
    id: 'r_default_hero',
    type: 'hero',
    placeholder: 'header',
    properties: { ...TOOLBOX_ITEMS[0].defaultProps }
  },
  {
    id: 'r_default_term',
    type: 'terminal',
    placeholder: 'main',
    properties: { ...TOOLBOX_ITEMS[4].defaultProps }
  },
  {
    id: 'r_default_feats',
    type: 'features',
    placeholder: 'main',
    properties: { ...TOOLBOX_ITEMS[3].defaultProps }
  },
  {
    id: 'r_default_quiz',
    type: 'quiz',
    placeholder: 'main',
    properties: { ...TOOLBOX_ITEMS[5].defaultProps }
  },
  {
    id: 'r_default_div',
    type: 'divider',
    placeholder: 'footer',
    properties: { ...TOOLBOX_ITEMS[8].defaultProps }
  },
  {
    id: 'r_default_testi',
    type: 'testimonial',
    placeholder: 'footer',
    properties: { ...TOOLBOX_ITEMS[7].defaultProps }
  }
];

export const SitecoreCMSView: React.FC<{ appState: UseAppStateReturnType }> = () => {
  const [layout, setLayout] = useState<RenderingInstance[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'presentation' | 'view'>('home');
  
  // Settings / Checks in Ribbon
  const [isDesigning, setIsDesigning] = useState(true);
  const [isDragDrop, setIsDragDrop] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  // Selected component in Canvas
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePropertyTab, setActivePropertyTab] = useState<'content' | 'style' | 'json'>('content');

  // Dragging states
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [canvasDraggingId, setCanvasDraggingId] = useState<string | null>(null);
  const [activePlaceholder, setActivePlaceholder] = useState<'header' | 'main' | 'footer' | null>(null);

  // Export Code Dialog
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportedCode, setExportedCode] = useState({ html: '', css: '' });

  // Floating toolbar positioning
  const [selectedElementRect, setSelectedElementRect] = useState<{ top: number; left: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load layout from local storage or set default preset
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LAYOUT);
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (_) {
        setLayout(DEFAULT_LAYOUT);
      }
    } else {
      setLayout(DEFAULT_LAYOUT);
    }
  }, []);

  // Save layout to storage helper
  const saveLayout = (newLayout: RenderingInstance[]) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(newLayout));
  };

  const handleSaveClick = () => {
    saveLayout(layout);
    showToast('💾 Sitecore Layout saved to LocalStorage!', 'rgba(0, 217, 160, 0.15)');
  };

  const handlePublishClick = () => {
    saveLayout(layout);
    showToast('🚀 Layout published successfully! Staging updated.', 'rgba(79, 168, 255, 0.15)');
  };

  const handleResetLayout = () => {
    if (window.confirm('Are you sure you want to reset this page to the default DevOps template?')) {
      saveLayout(DEFAULT_LAYOUT);
      setSelectedId(null);
      showToast('🔄 Restored default DevOps template.', 'rgba(255, 200, 80, 0.15)');
    }
  };

  // Reorder rendering inside placeholder list
  const moveRendering = (id: string, direction: 'up' | 'down') => {
    const index = layout.findIndex(item => item.id === id);
    if (index === -1) return;
    const placeholder = layout[index].placeholder;
    const placeholderItems = layout.filter(item => item.placeholder === placeholder);
    const placeIndex = placeholderItems.findIndex(item => item.id === id);

    if (direction === 'up' && placeIndex > 0) {
      const prevItem = placeholderItems[placeIndex - 1];
      const targetIndex = layout.findIndex(item => item.id === prevItem.id);
      
      const newLayout = [...layout];
      newLayout[index] = prevItem;
      newLayout[targetIndex] = layout[index];
      saveLayout(newLayout);
      triggerToolbarUpdate(id);
    } else if (direction === 'down' && placeIndex < placeholderItems.length - 1) {
      const nextItem = placeholderItems[placeIndex + 1];
      const targetIndex = layout.findIndex(item => item.id === nextItem.id);
      
      const newLayout = [...layout];
      newLayout[index] = nextItem;
      newLayout[targetIndex] = layout[index];
      saveLayout(newLayout);
      triggerToolbarUpdate(id);
    }
  };

  const deleteRendering = (id: string) => {
    const filtered = layout.filter(item => item.id !== id);
    saveLayout(filtered);
    setSelectedId(null);
    setSelectedElementRect(null);
    showToast('🗑️ Rendering removed.', 'var(--red)');
  };

  const updateProperties = (id: string, key: string, value: any) => {
    const newLayout = layout.map(item => {
      if (item.id === id) {
        return {
          ...item,
          properties: {
            ...item.properties,
            [key]: value
          }
        };
      }
      return item;
    });
    saveLayout(newLayout);
  };

  const updateRawJSON = (id: string, rawJSON: string) => {
    try {
      const parsed = JSON.parse(rawJSON);
      const newLayout = layout.map(item => {
        if (item.id === id) {
          return {
            ...item,
            properties: parsed
          };
        }
        return item;
      });
      saveLayout(newLayout);
    } catch (_) {
      // Allow user typing raw text before it fully validates
    }
  };

  // Drag & Drop handlers: Toolbox to Placeholders
  const handleToolboxDragStart = (e: React.DragEvent, type: string) => {
    if (!isDragDrop) return;
    setDraggingType(type);
    setCanvasDraggingId(null);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Drag & Drop handlers: Canvas Rendering to Placeholders
  const handleCanvasDragStart = (e: React.DragEvent, id: string) => {
    if (!isDragDrop) return;
    setCanvasDraggingId(id);
    setDraggingType(null);
    e.dataTransfer.setData('text/renderingId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, placeholder: 'header' | 'main' | 'footer') => {
    if (!isDragDrop) return;
    e.preventDefault();
    if (activePlaceholder !== placeholder) {
      setActivePlaceholder(placeholder);
    }
  };

  const handleDragLeave = () => {
    if (!isDragDrop) return;
    setActivePlaceholder(null);
  };

  const handleDragEnd = () => {
    setDraggingType(null);
    setCanvasDraggingId(null);
    setActivePlaceholder(null);
  };

  const handleDrop = (e: React.DragEvent, placeholder: 'header' | 'main' | 'footer') => {
    if (!isDragDrop) return;
    e.preventDefault();
    setActivePlaceholder(null);

    // Dropping from Toolbox (new rendering)
    if (draggingType) {
      const itemConfig = TOOLBOX_ITEMS.find(item => item.type === draggingType);
      if (itemConfig) {
        const newInstance: RenderingInstance = {
          id: `rendering_${Date.now()}`,
          type: draggingType,
          placeholder,
          properties: { ...itemConfig.defaultProps }
        };
        const newLayout = [...layout, newInstance];
        saveLayout(newLayout);
        setSelectedId(newInstance.id);
        showToast(`🏗️ Added rendering: ${itemConfig.name}`, 'rgba(0, 217, 160, 0.12)');
      }
    }

    // Moving existing rendering from placeholder to placeholder
    const renderId = e.dataTransfer.getData('text/renderingId') || canvasDraggingId;
    if (renderId) {
      const updated = layout.map(item => {
        if (item.id === renderId) {
          return { ...item, placeholder };
        }
        return item;
      });
      saveLayout(updated);
      setSelectedId(renderId);
      triggerToolbarUpdate(renderId);
      showToast(`📦 Rendering moved to ${placeholder}`, 'rgba(79, 168, 255, 0.12)');
    }

    // Clean up drag status
    setDraggingType(null);
    setCanvasDraggingId(null);
  };

  // Selection & Toolbar updates
  const handleRenderingSelect = (e: React.MouseEvent, item: RenderingInstance) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedId(item.id);
    
    // Find the relative coordinates for positioning the floating toolbar
    const element = e.currentTarget as HTMLElement;
    const parent = canvasRef.current;
    if (element && parent) {
      const elemRect = element.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      
      setSelectedElementRect({
        top: elemRect.top - parentRect.top + parent.scrollTop,
        left: elemRect.left - parentRect.left + parent.scrollLeft,
      });
    }
  };

  const triggerToolbarUpdate = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      const parent = canvasRef.current;
      if (element && parent) {
        const elemRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        setSelectedElementRect({
          top: elemRect.top - parentRect.top + parent.scrollTop,
          left: elemRect.left - parentRect.left + parent.scrollLeft,
        });
      }
    }, 100);
  };

  // Handle inline contentEditable changes
  const handleInlineChange = (id: string, propKey: string, e: React.FormEvent<HTMLSpanElement>) => {
    if (!isEditing) return;
    const value = e.currentTarget.textContent || '';
    updateProperties(id, propKey, value);
  };

  const handleCanvasClick = () => {
    setSelectedId(null);
    setSelectedElementRect(null);
  };

  // Standalone HTML/CSS Code Exporter
  const generateExportCode = () => {
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevOps Roadmap Landing Page</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090f;
      --s1: #0d1117;
      --s2: #141b26;
      --s3: #1c2436;
      --border: #222d42;
      --text: #e6edf3;
      --sub: #7d8fa8;
      --green: #00d9a0;
      --blue: #4fa8ff;
      --amber: #ffc850;
      --red: #ff5f5f;
      --body: 'Outfit', sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--body);
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .page-container {
      width: 100%;
      max-width: 900px;
      padding: 40px 16px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    header, main, footer {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    /* Hero Banner styles */
    .hero-banner {
      padding: 50px 30px;
      text-align: center;
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    .hero-banner h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 16px 0;
    }
    .hero-banner p {
      color: var(--sub);
      font-size: 15px;
      margin: 0 0 24px 0;
    }
    .hero-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn {
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
    }
    
    /* Rich Text block styles */
    .text-block {
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .text-block h2 {
      font-size: 22px;
      margin: 0 0 10px 0;
    }
    .text-block p {
      color: var(--sub);
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }

    /* Feature Grid styles */
    .features-section {
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .features-section h2 {
      font-size: 20px;
      text-align: center;
      margin: 0 0 20px 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .feature-card {
      background: var(--s2);
      border: 1px solid var(--border);
      padding: 18px;
      border-radius: 8px;
      text-align: center;
    }
    .feature-card span {
      font-size: 24px;
      margin-bottom: 8px;
      display: inline-block;
    }
    .feature-card h3 {
      font-size: 14px;
      margin: 0 0 6px 0;
    }
    .feature-card p {
      font-size: 12px;
      color: var(--sub);
      margin: 0;
    }

    /* Terminal Simulator styles */
    .terminal {
      background: #000;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      font-family: var(--mono);
    }
    .term-hdr {
      background: var(--s1);
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: var(--sub);
    }
    .term-body {
      padding: 16px;
      font-size: 12px;
      color: var(--green);
      white-space: pre-wrap;
    }

    /* Quiz block */
    .quiz-card {
      background: var(--s1);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    .quiz-question {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .quiz-opts {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .quiz-opt {
      background: var(--s2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .quiz-opt:hover {
      background: var(--s3);
    }

    /* Project Showcase */
    .project-card {
      border: 1px solid var(--border);
      background: var(--s1);
      padding: 20px;
      border-radius: 12px;
      display: flex;
      gap: 16px;
    }
    .proj-icon {
      font-size: 28px;
      background: var(--s2);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .proj-title {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .proj-badge {
      font-size: 9px;
      background: rgba(0, 217, 160, 0.1);
      color: var(--green);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .proj-desc {
      font-size: 12.5px;
      color: var(--sub);
      margin-top: 6px;
    }
    .proj-tags {
      margin-top: 10px;
      display: flex;
      gap: 8px;
    }
    .proj-tag {
      font-size: 10px;
      color: var(--sub);
      background: var(--s2);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    /* Testimonial styles */
    .testimonial {
      border-left: 4px solid var(--blue);
      background: var(--s2);
      padding: 20px;
      border-radius: 0 12px 12px 0;
    }
    .testimonial-quote {
      font-size: 14px;
      font-style: italic;
      margin-bottom: 12px;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--s3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
    }
    .author-info h4 {
      margin: 0;
      font-size: 12.5px;
    }
    .author-info span {
      font-size: 11px;
      color: var(--sub);
    }

    /* Divider styles */
    .divider {
      display: flex;
      align-items: center;
      padding: 20px 0;
    }
    .divider-line {
      height: 1px;
      background: var(--border);
      flex: 1;
    }
    .divider-icon {
      padding: 0 16px;
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="page-container">
`;

    // Process place by place
    (['header', 'main', 'footer'] as const).forEach(placeholder => {
      htmlContent += `    <${placeholder}>\n`;
      const renderInsts = layout.filter(item => item.placeholder === placeholder);
      
      renderInsts.forEach(item => {
        const props = item.properties;
        const styles = `background: linear-gradient(135deg, ${props.bgGradStart || 'var(--s1)'}, ${props.bgGradEnd || 'var(--s2)'}); text-align: ${props.align || 'left'};`;
        
        switch (item.type) {
          case 'hero':
            htmlContent += `      <!-- Sitecore Rendering: Hero Banner -->
      <div class="hero-banner" style="${styles}">
        <h1>${props.title}</h1>
        <p>${props.subtitle}</p>
        <div class="hero-buttons">
          <a href="#" class="btn" style="background: ${props.btn1Color || 'var(--green)'}; color: #000;">${props.btn1Text}</a>
          <a href="#" class="btn" style="background: var(--s3); color: var(--text); border: 1px solid var(--border);">${props.btn2Text}</a>
        </div>
      </div>\n\n`;
            break;
          case 'cta':
            htmlContent += `      <!-- Sitecore Rendering: Call to Action -->
      <div class="hero-banner" style="${styles}">
        <h2>${props.title}</h2>
        <p>${props.subtitle}</p>
        <div class="hero-buttons">
          <a href="#" class="btn" style="background: var(--blue); color: #000;">${props.btnText}</a>
        </div>
      </div>\n\n`;
            break;
          case 'text':
            htmlContent += `      <!-- Sitecore Rendering: Rich Text Block -->
      <div class="text-block" style="${styles}">
        <h2>${props.title}</h2>
        <p>${props.body}</p>
      </div>\n\n`;
            break;
          case 'features':
            htmlContent += `      <!-- Sitecore Rendering: Feature Grid -->
      <div class="features-section" style="${styles}">
        <h2>${props.title}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <span>${props.item1Icon}</span>
            <h3>${props.item1Title}</h3>
            <p>${props.item1Desc}</p>
          </div>
          <div class="feature-card">
            <span>${props.item2Icon}</span>
            <h3>${props.item2Title}</h3>
            <p>${props.item2Desc}</p>
          </div>
          <div class="feature-card">
            <span>${props.item3Icon}</span>
            <h3>${props.item3Title}</h3>
            <p>${props.item3Desc}</p>
          </div>
        </div>
      </div>\n\n`;
            break;
          case 'terminal':
            htmlContent += `      <!-- Sitecore Rendering: DevOps Terminal -->
      <div class="terminal">
        <div class="term-hdr">
          <span>${props.title}</span>
          <span>bash</span>
        </div>
        <div class="term-body">${props.output}</div>
      </div>\n\n`;
            break;
          case 'quiz':
            htmlContent += `      <!-- Sitecore Rendering: Study Quiz -->
      <div class="quiz-card" style="${styles}">
        <div class="quiz-question">${props.question}</div>
        <div class="quiz-opts">
          <div class="quiz-opt">${props.opt1}</div>
          <div class="quiz-opt">${props.opt2}</div>
          <div class="quiz-opt">${props.opt3}</div>
          <div class="quiz-opt">${props.opt4}</div>
        </div>
      </div>\n\n`;
            break;
          case 'project':
            htmlContent += `      <!-- Sitecore Rendering: Project Showcase -->
      <div class="project-card" style="${styles}">
        <div class="proj-icon">📂</div>
        <div class="proj-details">
          <div class="proj-title">
            <span>${props.title}</span>
            <span class="proj-badge">${props.badge}</span>
          </div>
          <div class="proj-desc">${props.desc}</div>
          <div class="proj-tags">
            <span class="proj-tag">${props.tag1}</span>
            <span class="proj-tag">${props.tag2}</span>
            <span class="proj-tag">${props.tag3}</span>
          </div>
        </div>
      </div>\n\n`;
            break;
          case 'testimonial':
            htmlContent += `      <!-- Sitecore Rendering: Testimonial Card -->
      <div class="testimonial">
        <div class="testimonial-quote">"${props.quote}"</div>
        <div class="testimonial-author">
          <div class="avatar">${props.avatar}</div>
          <div class="author-info">
            <h4>${props.author}</h4>
            <span>${props.role}</span>
          </div>
        </div>
      </div>\n\n`;
            break;
          case 'divider':
            htmlContent += `      <!-- Sitecore Rendering: Divider -->
      <div class="divider">
        <div class="divider-line" style="background-color: ${props.color || 'var(--border)'};"></div>
        <span class="divider-icon">${props.iconSymbol}</span>
        <div class="divider-line" style="background-color: ${props.color || 'var(--border)'};"></div>
      </div>\n\n`;
            break;
        }
      });

      htmlContent += `    </${placeholder}>\n`;
    });

    htmlContent += `  </div>
</body>
</html>`;

    setExportedCode({ html: htmlContent, css: '' });
    setIsExportOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedCode.html);
    showToast('📋 Standalone HTML page copied to clipboard!', 'rgba(0, 217, 160, 0.15)');
  };

  // Rendering template renderer for the visual canvas
  const renderComponentVisual = (item: RenderingInstance) => {
    const props = item.properties;
    
    // Style mapper
    const alignStyle = props.align ? { textAlign: props.align } : {};
    const paddingStyle = props.padding === 'small' ? { padding: '12px' } 
      : props.padding === 'large' ? { padding: '48px 24px' } 
      : { padding: '24px 16px' };
    
    const bgStyle = (props.bgGradStart || props.bgGradEnd) ? {
      background: `linear-gradient(135deg, ${props.bgGradStart || 'var(--s1)'}, ${props.bgGradEnd || 'var(--s2)'})`
    } : {};

    const customStyles = {
      ...alignStyle,
      ...paddingStyle,
      ...bgStyle
    } as React.CSSProperties;

    const renderEditableText = (key: string, className: string, tagType: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div') => {
      const Tag = tagType;
      return (
        <Tag
          className={`${className} cms-editable ${isEditing ? 'editing-enabled' : ''}`}
          contentEditable={isEditing && !isPreview}
          suppressContentEditableWarning
          onBlur={(e) => handleInlineChange(item.id, key, e)}
        >
          {props[key]}
        </Tag>
      );
    };

    switch (item.type) {
      case 'hero':
        return (
          <div className="cms-render-hero" style={customStyles}>
            {renderEditableText('title', 'cms-render-hero-title', 'h1')}
            {renderEditableText('subtitle', 'cms-render-hero-sub', 'p')}
            <div className="cms-render-hero-btns">
              <span 
                className={`cms-render-hero-btn cms-editable ${isEditing ? 'editing-enabled' : ''}`}
                contentEditable={isEditing && !isPreview}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineChange(item.id, 'btn1Text', e)}
                style={{ background: props.btn1Color || 'var(--green)' }}
              >
                {props.btn1Text}
              </span>
              <span 
                className={`cms-render-hero-btn sec cms-editable ${isEditing ? 'editing-enabled' : ''}`}
                contentEditable={isEditing && !isPreview}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineChange(item.id, 'btn2Text', e)}
              >
                {props.btn2Text}
              </span>
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="cms-render-hero" style={customStyles}>
            {renderEditableText('title', 'cms-render-hero-title', 'h2')}
            {renderEditableText('subtitle', 'cms-render-hero-sub', 'p')}
            <div className="cms-render-hero-btns">
              <span 
                className={`cms-render-hero-btn cms-editable ${isEditing ? 'editing-enabled' : ''}`}
                contentEditable={isEditing && !isPreview}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineChange(item.id, 'btnText', e)}
                style={{ background: 'var(--blue)' }}
              >
                {props.btnText}
              </span>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="cms-render-text" style={customStyles}>
            {renderEditableText('title', 'cms-render-text-title', 'h2')}
            {renderEditableText('body', 'cms-render-text-body', 'p')}
          </div>
        );
      case 'features':
        return (
          <div className="cms-render-features" style={customStyles}>
            {renderEditableText('title', 'cms-render-features-title', 'h2')}
            <div className="cms-render-features-grid">
              <div className="cms-render-feature-card">
                <span className="cms-render-feature-icon">{props.item1Icon}</span>
                {renderEditableText('item1Title', 'cms-render-feature-name', 'h3')}
                {renderEditableText('item1Desc', 'cms-render-feature-desc', 'p')}
              </div>
              <div className="cms-render-feature-card">
                <span className="cms-render-feature-icon">{props.item2Icon}</span>
                {renderEditableText('item2Title', 'cms-render-feature-name', 'h3')}
                {renderEditableText('item2Desc', 'cms-render-feature-desc', 'p')}
              </div>
              <div className="cms-render-feature-card">
                <span className="cms-render-feature-icon">{props.item3Icon}</span>
                {renderEditableText('item3Title', 'cms-render-feature-name', 'h3')}
                {renderEditableText('item3Desc', 'cms-render-feature-desc', 'p')}
              </div>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="cms-render-terminal">
            <div className="cms-render-term-header">
              <div className="cms-render-term-dots">
                <span className="cms-render-term-dot" style={{ background: '#ff5f5f' }}></span>
                <span className="cms-render-term-dot" style={{ background: '#ffc850' }}></span>
                <span className="cms-render-term-dot" style={{ background: '#00d9a0' }}></span>
              </div>
              {renderEditableText('title', '', 'span')}
              <span style={{ fontSize: '8.5px', color: 'var(--muted)' }}>bash</span>
            </div>
            <div className="cms-render-term-body">
              <pre 
                className={`cms-editable ${isEditing ? 'editing-enabled' : ''}`}
                contentEditable={isEditing && !isPreview}
                suppressContentEditableWarning
                onBlur={(e) => handleInlineChange(item.id, 'output', e)}
                style={{ margin: 0, fontFamily: 'var(--mono)' }}
              >
                {props.output}
              </pre>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="cms-render-quiz" style={customStyles}>
            {renderEditableText('question', 'cms-render-quiz-title', 'h3')}
            <div className="cms-render-quiz-opts">
              <div className="cms-render-quiz-opt">{props.opt1}</div>
              <div className="cms-render-quiz-opt">{props.opt2}</div>
              <div className="cms-render-quiz-opt">{props.opt3}</div>
              <div className="cms-render-quiz-opt">{props.opt4}</div>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--sub)', marginTop: '12px', opacity: 0.8 }}>
              💡 <b>Explanation:</b> {props.explanation}
            </div>
          </div>
        );
      case 'project':
        return (
          <div className="cms-render-project" style={customStyles}>
            <div className="cms-render-proj-icon">📂</div>
            <div className="cms-render-proj-details">
              <div className="cms-render-proj-title">
                {renderEditableText('title', '', 'span')}
                <span className="cms-render-proj-badge">{props.badge}</span>
              </div>
              {renderEditableText('desc', 'cms-render-proj-desc', 'p')}
              <div className="cms-render-proj-footer">
                <span className="cms-render-proj-tag">{props.tag1}</span>
                <span className="cms-render-proj-tag">{props.tag2}</span>
                <span className="cms-render-proj-tag">{props.tag3}</span>
              </div>
            </div>
          </div>
        );
      case 'testimonial':
        return (
          <div className="cms-render-testimonial">
            <div className="cms-render-test-quote">
              " {renderEditableText('quote', '', 'span')} "
            </div>
            <div className="cms-render-test-author">
              <div className="cms-render-test-avatar">{props.avatar}</div>
              <div className="cms-render-test-info">
                {renderEditableText('author', 'cms-render-test-name', 'div')}
                {renderEditableText('role', 'cms-render-test-role', 'div')}
              </div>
            </div>
          </div>
        );
      case 'divider':
        return (
          <div className="cms-render-divider">
            <div className="cms-render-divider-line" style={{ backgroundColor: props.color || 'var(--border)' }}></div>
            <span className="cms-render-divider-icon">{props.iconSymbol}</span>
            <div className="cms-render-divider-line" style={{ backgroundColor: props.color || 'var(--border)' }}></div>
          </div>
        );
      default:
        return <div style={{ padding: '12px', fontSize: '11px', color: 'var(--sub)' }}>Rendering: {item.type}</div>;
    }
  };

  const getSelectedRendering = () => {
    return layout.find(item => item.id === selectedId) || null;
  };

  const selectedRendering = getSelectedRendering();

  return (
    <div className="cms-container">
      {/* Sitecore Ribbon */}
      <div className="cms-ribbon">
        <div className="cms-ribbon-tabs">
          <button 
            className={`cms-ribbon-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`cms-ribbon-tab ${activeTab === 'presentation' ? 'active' : ''}`}
            onClick={() => setActiveTab('presentation')}
          >
            Presentation
          </button>
          <button 
            className={`cms-ribbon-tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View
          </button>
        </div>

        <div className="cms-ribbon-panels">
          {activeTab === 'home' && (
            <>
              <div className="cms-ribbon-group">
                <button className="cms-ribbon-btn accent" onClick={handleSaveClick}>
                  <span className="cms-ribbon-btn-icon">💾</span>
                  <span>Save</span>
                </button>
                <button className="cms-ribbon-btn" onClick={handlePublishClick}>
                  <span className="cms-ribbon-btn-icon">🚀</span>
                  <span>Publish</span>
                </button>
                <div className="cms-ribbon-group-label">Save & Deploy</div>
              </div>
              <div className="cms-ribbon-group">
                <button className="cms-ribbon-btn" onClick={generateExportCode}>
                  <span className="cms-ribbon-btn-icon">📄</span>
                  <span>Export Code</span>
                </button>
                <button className="cms-ribbon-btn" onClick={handleResetLayout}>
                  <span className="cms-ribbon-btn-icon">🔄</span>
                  <span>Reset</span>
                </button>
                <div className="cms-ribbon-group-label">Actions</div>
              </div>
            </>
          )}

          {activeTab === 'presentation' && (
            <>
              <div className="cms-ribbon-group">
                <button 
                  className={`cms-ribbon-btn ${selectedId ? '' : 'disabled'}`}
                  disabled={!selectedId}
                  onClick={() => selectedId && deleteRendering(selectedId)}
                  style={{ opacity: selectedId ? 1 : 0.4 }}
                >
                  <span className="cms-ribbon-btn-icon" style={{ color: 'var(--red)' }}>🗑️</span>
                  <span>Delete</span>
                </button>
                <div className="cms-ribbon-group-label">Modify Component</div>
              </div>
              <div className="cms-ribbon-group">
                <button 
                  className={`cms-ribbon-btn ${selectedId ? '' : 'disabled'}`} 
                  disabled={!selectedId}
                  onClick={() => selectedId && moveRendering(selectedId, 'up')}
                  style={{ opacity: selectedId ? 1 : 0.4 }}
                >
                  <span className="cms-ribbon-btn-icon">⬆</span>
                  <span>Move Up</span>
                </button>
                <button 
                  className={`cms-ribbon-btn ${selectedId ? '' : 'disabled'}`} 
                  disabled={!selectedId}
                  onClick={() => selectedId && moveRendering(selectedId, 'down')}
                  style={{ opacity: selectedId ? 1 : 0.4 }}
                >
                  <span className="cms-ribbon-btn-icon">⬇</span>
                  <span>Move Down</span>
                </button>
                <div className="cms-ribbon-group-label">Reorder</div>
              </div>
            </>
          )}

          {activeTab === 'view' && (
            <>
              <div className="cms-ribbon-group">
                <div className="cms-ribbon-toggle-group">
                  <label className="cms-ribbon-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={isDesigning} 
                      onChange={(e) => setIsDesigning(e.target.checked)} 
                    />
                    Designing (Borders)
                  </label>
                  <label className="cms-ribbon-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={isDragDrop} 
                      onChange={(e) => setIsDragDrop(e.target.checked)} 
                    />
                    Drag & Drop
                  </label>
                  <label className="cms-ribbon-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={isEditing} 
                      onChange={(e) => setIsEditing(e.target.checked)} 
                    />
                    Editing (Inline Text)
                  </label>
                </div>
                <div className="cms-ribbon-group-label">Editor Settings</div>
              </div>
            </>
          )}

          {/* Mode Switcher */}
          <div className="cms-ribbon-mode-switch">
            <button 
              className={`cms-ribbon-mode-btn ${!isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(false)}
            >
              🛠️ Edit Mode
            </button>
            <button 
              className={`cms-ribbon-mode-btn ${isPreview ? 'active' : ''}`}
              onClick={() => {
                setIsPreview(true);
                setSelectedId(null);
                setSelectedElementRect(null);
              }}
            >
              👁️ Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="cms-editor-workspace">
        {/* Left Content Tree */}
        {!isPreview && (
          <div className="cms-sidebar">
            <div className="cms-sidebar-header">
              <span>🌳 Content Tree</span>
            </div>
            <div className="cms-sidebar-body">
              <div className="cms-tree-item">
                <div className="cms-tree-node active">
                  <span>📄</span>
                  <span>devops-roadmap-page</span>
                </div>
                <div className="cms-tree-children">
                  {/* Header Placeholders */}
                  <div className="cms-tree-item">
                    <div className="cms-tree-node placeholder">
                      <span>📥</span>
                      <span>header</span>
                    </div>
                    <div className="cms-tree-children">
                      {layout.filter(item => item.placeholder === 'header').map(item => (
                        <div 
                          key={item.id} 
                          className={`cms-tree-node ${selectedId === item.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedId(item.id);
                            triggerToolbarUpdate(item.id);
                          }}
                        >
                          <span>⚙️</span>
                          <span>{TOOLBOX_ITEMS.find(t => t.type === item.type)?.name || item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Placeholders */}
                  <div className="cms-tree-item">
                    <div className="cms-tree-node placeholder">
                      <span>📥</span>
                      <span>main</span>
                    </div>
                    <div className="cms-tree-children">
                      {layout.filter(item => item.placeholder === 'main').map(item => (
                        <div 
                          key={item.id} 
                          className={`cms-tree-node ${selectedId === item.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedId(item.id);
                            triggerToolbarUpdate(item.id);
                          }}
                        >
                          <span>⚙️</span>
                          <span>{TOOLBOX_ITEMS.find(t => t.type === item.type)?.name || item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Placeholders */}
                  <div className="cms-tree-item">
                    <div className="cms-tree-node placeholder">
                      <span>📥</span>
                      <span>footer</span>
                    </div>
                    <div className="cms-tree-children">
                      {layout.filter(item => item.placeholder === 'footer').map(item => (
                        <div 
                          key={item.id} 
                          className={`cms-tree-node ${selectedId === item.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedId(item.id);
                            triggerToolbarUpdate(item.id);
                          }}
                        >
                          <span>⚙️</span>
                          <span>{TOOLBOX_ITEMS.find(t => t.type === item.type)?.name || item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Canvas Container */}
        <div className={`cms-canvas-container ${isPreview ? 'preview-mode' : ''}`} onClick={handleCanvasClick}>
          <div 
            ref={canvasRef}
            className={`cms-canvas ${isPreview ? 'preview-mode' : ''}`}
          >
            {/* Header Placeholders */}
            <div 
              className={`cms-placeholder ${isDesigning && !isPreview ? 'design-mode' : ''} ${activePlaceholder === 'header' ? 'drag-over' : ''}`}
              data-placeholder-name="header"
              onDragOver={(e) => handleDragOver(e, 'header')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'header')}
            >
              {layout.filter(item => item.placeholder === 'header').length === 0 && !isPreview && (
                <div className="cms-placeholder-empty">Drop header components here</div>
              )}
              {layout.filter(item => item.placeholder === 'header').map(item => (
                <div 
                  key={item.id}
                  id={item.id}
                  draggable={isDragDrop && !isPreview}
                  onDragStart={(e) => handleCanvasDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleRenderingSelect(e, item)}
                  className={`cms-rendering ${isDesigning && !isPreview ? 'design-mode' : ''} ${selectedId === item.id ? 'selected' : ''}`}
                >
                  {renderComponentVisual(item)}
                </div>
              ))}
            </div>

            {/* Main Placeholders */}
            <div 
              className={`cms-placeholder ${isDesigning && !isPreview ? 'design-mode' : ''} ${activePlaceholder === 'main' ? 'drag-over' : ''}`}
              data-placeholder-name="main"
              onDragOver={(e) => handleDragOver(e, 'main')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'main')}
            >
              {layout.filter(item => item.placeholder === 'main').length === 0 && !isPreview && (
                <div className="cms-placeholder-empty">Drop main content components here</div>
              )}
              {layout.filter(item => item.placeholder === 'main').map(item => (
                <div 
                  key={item.id}
                  id={item.id}
                  draggable={isDragDrop && !isPreview}
                  onDragStart={(e) => handleCanvasDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleRenderingSelect(e, item)}
                  className={`cms-rendering ${isDesigning && !isPreview ? 'design-mode' : ''} ${selectedId === item.id ? 'selected' : ''}`}
                >
                  {renderComponentVisual(item)}
                </div>
              ))}
            </div>

            {/* Footer Placeholders */}
            <div 
              className={`cms-placeholder ${isDesigning && !isPreview ? 'design-mode' : ''} ${activePlaceholder === 'footer' ? 'drag-over' : ''}`}
              data-placeholder-name="footer"
              onDragOver={(e) => handleDragOver(e, 'footer')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'footer')}
            >
              {layout.filter(item => item.placeholder === 'footer').length === 0 && !isPreview && (
                <div className="cms-placeholder-empty">Drop footer components here</div>
              )}
              {layout.filter(item => item.placeholder === 'footer').map(item => (
                <div 
                  key={item.id}
                  id={item.id}
                  draggable={isDragDrop && !isPreview}
                  onDragStart={(e) => handleCanvasDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleRenderingSelect(e, item)}
                  className={`cms-rendering ${isDesigning && !isPreview ? 'design-mode' : ''} ${selectedId === item.id ? 'selected' : ''}`}
                >
                  {renderComponentVisual(item)}
                </div>
              ))}
            </div>

            {/* Floating toolbar for rendering context options */}
            {selectedId && selectedElementRect && !isPreview && (
              <div 
                className="cms-floating-toolbar"
                style={{
                  top: `${selectedElementRect.top - 38}px`,
                  left: `${selectedElementRect.left + 16}px`
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="cms-toolbar-label">Rendering</div>
                <button 
                  className="cms-toolbar-btn" 
                  title="Move Up" 
                  onClick={() => moveRendering(selectedId, 'up')}
                >
                  ⬆
                </button>
                <button 
                  className="cms-toolbar-btn" 
                  title="Move Down" 
                  onClick={() => moveRendering(selectedId, 'down')}
                >
                  ⬇
                </button>
                <button 
                  className="cms-toolbar-btn" 
                  title="Properties" 
                  onClick={() => setActivePropertyTab('content')}
                  style={{ color: 'var(--blue)' }}
                >
                  ⚙️
                </button>
                <button 
                  className="cms-toolbar-btn delete" 
                  title="Delete" 
                  onClick={() => deleteRendering(selectedId)}
                >
                  🗑️
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Sidebar: Properties & Toolbox */}
        {!isPreview && (
          <div className="cms-sidebar right">
            {selectedRendering ? (
              // Selected component properties inspector
              <>
                <div className="cms-sidebar-header">
                  <span>⚙️ Component Properties</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer' }}
                    onClick={() => setSelectedId(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="cms-sidebar-body">
                  <div className="cms-prop-tabs">
                    <button 
                      className={`cms-prop-tab ${activePropertyTab === 'content' ? 'active' : ''}`}
                      onClick={() => setActivePropertyTab('content')}
                    >
                      Content
                    </button>
                    <button 
                      className={`cms-prop-tab ${activePropertyTab === 'style' ? 'active' : ''}`}
                      onClick={() => setActivePropertyTab('style')}
                    >
                      Styles
                    </button>
                    <button 
                      className={`cms-prop-tab ${activePropertyTab === 'json' ? 'active' : ''}`}
                      onClick={() => setActivePropertyTab('json')}
                    >
                      JSON
                    </button>
                  </div>

                  {activePropertyTab === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Dynamic content forms depending on rendering type */}
                      {Object.keys(selectedRendering.properties).map(key => {
                        // Skip styling props
                        if (['bgGradStart', 'bgGradEnd', 'align', 'padding', 'borderRadius', 'color'].includes(key)) return null;
                        
                        const val = selectedRendering.properties[key];
                        return (
                          <div key={key} className="cms-prop-group">
                            <label className="cms-prop-label">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {val.length > 50 ? (
                              <textarea 
                                className="cms-prop-textarea"
                                value={val}
                                onChange={(e) => updateProperties(selectedRendering.id, key, e.target.value)}
                              />
                            ) : (
                              <input 
                                type="text"
                                className="cms-prop-input"
                                value={val}
                                onChange={(e) => updateProperties(selectedRendering.id, key, e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activePropertyTab === 'style' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Styles configuration */}
                      {selectedRendering.properties.hasOwnProperty('align') && (
                        <div className="cms-prop-group">
                          <label className="cms-prop-label">Alignment</label>
                          <select 
                            className="cms-prop-select"
                            value={selectedRendering.properties.align}
                            onChange={(e) => updateProperties(selectedRendering.id, 'align', e.target.value)}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      )}
                      
                      {selectedRendering.properties.hasOwnProperty('padding') && (
                        <div className="cms-prop-group">
                          <label className="cms-prop-label">Padding</label>
                          <select 
                            className="cms-prop-select"
                            value={selectedRendering.properties.padding}
                            onChange={(e) => updateProperties(selectedRendering.id, 'padding', e.target.value)}
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      )}

                      {selectedRendering.properties.hasOwnProperty('bgGradStart') && (
                        <>
                          <div className="cms-prop-group">
                            <label className="cms-prop-label">Background Gradient Start</label>
                            <input 
                              type="text" 
                              className="cms-prop-input"
                              placeholder="#0d1117"
                              value={selectedRendering.properties.bgGradStart}
                              onChange={(e) => updateProperties(selectedRendering.id, 'bgGradStart', e.target.value)}
                            />
                          </div>
                          <div className="cms-prop-group">
                            <label className="cms-prop-label">Background Gradient End</label>
                            <input 
                              type="text" 
                              className="cms-prop-input"
                              placeholder="#141b26"
                              value={selectedRendering.properties.bgGradEnd}
                              onChange={(e) => updateProperties(selectedRendering.id, 'bgGradEnd', e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {selectedRendering.properties.hasOwnProperty('color') && (
                        <div className="cms-prop-group">
                          <label className="cms-prop-label">Theme Color</label>
                          <input 
                            type="text" 
                            className="cms-prop-input"
                            value={selectedRendering.properties.color}
                            onChange={(e) => updateProperties(selectedRendering.id, 'color', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activePropertyTab === 'json' && (
                    <div className="cms-prop-group">
                      <label className="cms-prop-label">Raw Component Datasource</label>
                      <textarea 
                        className="cms-json-editor"
                        value={JSON.stringify(selectedRendering.properties, null, 2)}
                        onChange={(e) => updateRawJSON(selectedRendering.id, e.target.value)}
                      />
                      <div style={{ fontSize: '9px', color: 'var(--sub)', marginTop: '4px' }}>
                        💡 Direct state modification. Output must be a valid JSON object.
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Component Toolbox
              <>
                <div className="cms-sidebar-header">
                  <span>🎨 Rendering Toolbox</span>
                </div>
                <div className="cms-sidebar-body">
                  {(['Structure', 'Hero & Headers', 'Page Content', 'Interactive Elements'] as const).map(cat => (
                    <div key={cat} className="cms-toolbox-category">
                      <div className="cms-toolbox-category-title">{cat}</div>
                      <div className="cms-toolbox-items">
                        {TOOLBOX_ITEMS.filter(item => item.category === cat).map(item => (
                          <div
                            key={item.type}
                            draggable={isDragDrop}
                            onDragStart={(e) => handleToolboxDragStart(e, item.type)}
                            onDragEnd={handleDragEnd}
                            className="cms-toolbox-item"
                          >
                            <span className="cms-toolbox-icon">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '8px', background: 'var(--s2)', borderRadius: '6px', fontSize: '9.5px', color: 'var(--sub)', border: '1px solid var(--border)', marginTop: '20px', lineHeight: 1.4 }}>
                    💡 <b>Tip:</b> Drag any item from this panel and drop it into a dashed placeholder on the canvas. Click items on the canvas to configure properties!
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Code Export Modal */}
      {isExportOpen && (
        <div className="cms-export-modal" onClick={() => setIsExportOpen(false)}>
          <div className="cms-export-box" onClick={e => e.stopPropagation()}>
            <div className="cms-export-header">
              <span className="cms-export-title">📋 Exported Standalone Static HTML</span>
              <button className="cms-export-close" onClick={() => setIsExportOpen(false)}>✕</button>
            </div>
            <div className="cms-export-body">
              <div className="cms-export-desc">
                Below is the compiled static HTML code representing your customized layout. It includes all components, assets, structured templates, and inline CSS styles, making it fully ready to be published on any web host!
              </div>
              <div className="cms-code-preview">
                {exportedCode.html}
              </div>
            </div>
            <div className="cms-export-footer">
              <button 
                className="v4-btn-secondary" 
                onClick={() => setIsExportOpen(false)}
              >
                Close
              </button>
              <button 
                className="v4-btn-primary" 
                onClick={copyToClipboard}
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SitecoreCMSView;
