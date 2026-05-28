
UPDATE themes SET
  color_palette = '{
    "background": "0 0% 6%",
    "foreground": "0 0% 95%",
    "card": "0 0% 9%",
    "cardForeground": "0 0% 95%",
    "popover": "0 0% 9%",
    "popoverForeground": "0 0% 95%",
    "primary": "38 45% 60%",
    "primaryForeground": "0 0% 6%",
    "secondary": "0 0% 15%",
    "secondaryForeground": "0 0% 90%",
    "muted": "0 0% 12%",
    "mutedForeground": "0 0% 60%",
    "accent": "38 45% 60%",
    "accentForeground": "0 0% 6%",
    "destructive": "0 62% 50%",
    "destructiveForeground": "0 0% 100%",
    "border": "0 0% 18%",
    "input": "0 0% 18%",
    "ring": "38 45% 60%",
    "warmCream": "38 30% 90%",
    "warmBeige": "38 25% 80%",
    "warmBrown": "30 20% 30%",
    "darkWood": "30 15% 15%",
    "goldAccent": "38 45% 60%",
    "sageGreen": "150 10% 40%"
  }'::jsonb,
  typography = '{
    "fontSans": "Inter, system-ui, sans-serif",
    "fontSerif": "Playfair Display, Georgia, serif",
    "fontHeading": "Playfair Display, Georgia, serif"
  }'::jsonb,
  component_styles = '{
    "borderRadius": "0.5rem",
    "buttonRadius": "0.25rem",
    "cardRadius": "0.75rem",
    "shadowSm": "0 1px 3px rgba(0,0,0,0.3)",
    "shadowMd": "0 4px 12px rgba(0,0,0,0.4)",
    "shadowLg": "0 10px 30px rgba(0,0,0,0.5)"
  }'::jsonb,
  layout_settings = '{
    "containerMaxWidth": "1400px",
    "sectionSpacing": "6rem",
    "cardPadding": "2rem"
  }'::jsonb,
  is_dark = true,
  name = 'WOODMAX Premium Dark'
WHERE id = 'd6551bbd-05e7-43f0-89b7-026396f42ae9';
