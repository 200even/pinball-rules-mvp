import { NextRequest, NextResponse } from 'next/server';
import { createRuleSection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { ruleset_id, markdown } = await request.json();
    
    const sections = parseMarkdownSections(markdown);
    const createdSections = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const ruleSection = await createRuleSection({
        ruleset_id,
        section_type: section.type,
        title: section.title,
        body: section.body,
        facts: section.facts,
        order_idx: i,
      });
      createdSections.push(ruleSection);
    }
    
    return NextResponse.json(createdSections);
  } catch (error) {
    console.error('Error processing markdown:', error);
    return NextResponse.json({ error: 'Failed to process markdown' }, { status: 500 });
  }
}

function parseMarkdownSections(markdown: string) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('#')) {
      if (currentSection) {
        sections.push({
          ...currentSection,
          body: currentContent.join('\n').trim(),
        });
      }
      
      const headerLevel = (trimmedLine.match(/^#+/) || [''])[0].length;
      const title = trimmedLine.replace(/^#+\s*/, '');
      
      currentSection = {
        title,
        type: getSectionType(title, headerLevel),
        facts: {},
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  if (currentSection) {
    sections.push({
      ...currentSection,
      body: currentContent.join('\n').trim(),
    });
  }
  
  return sections;
}

function getSectionType(title: string, level: number): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('overview')) return 'overview';
  if (titleLower.includes('multiball')) return 'multiball';
  if (titleLower.includes('wizard')) return 'wizard_mode';
  if (titleLower.includes('bonus')) return 'scoring';
  if (level === 1) return 'major_feature';
  if (level === 2) return 'feature';
  
  return 'rule';
}
