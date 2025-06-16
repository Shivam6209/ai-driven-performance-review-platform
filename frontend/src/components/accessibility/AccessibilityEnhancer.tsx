import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  Divider,
  IconButton,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Close as CloseIcon,
  FormatSize as FontSizeIcon,
  Visibility as VisibilityIcon,
  VolumeUp as VolumeUpIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindFriendly: boolean;
  textToSpeech: boolean;
  dyslexiaFriendly: boolean;
  colorScheme: 'default' | 'dark' | 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 16,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
  colorBlindFriendly: false,
  textToSpeech: false,
  dyslexiaFriendly: false,
  colorScheme: 'default',
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  announceToScreenReader: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

const AccessibilityEnhancer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [panelOpen, setPanelOpen] = useState(false);
  const [skipLinksVisible, setSkipLinksVisible] = useState(false);
  const theme = useTheme();

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // For now, use localStorage as fallback until user auth is available
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('accessibility-settings');
          if (saved) {
            const loadedSettings = { ...defaultSettings, ...JSON.parse(saved) };
            setSettings(loadedSettings);
            applyAccessibilitySettings(loadedSettings);
          }
        }
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    try {
      // For now, save to localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
      }
      applyAccessibilitySettings(settings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }, [settings]);

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = (settings: AccessibilitySettings): void => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Dyslexia-friendly font
    if (settings.dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly');
    } else {
      root.classList.remove('dyslexia-friendly');
    }
    
    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const resetSettings = (): void => {
    setSettings(defaultSettings);
    announceToScreenReader('Accessibility settings have been reset to default');
  };

  const getAccessibilityTheme = () => {
    let themeOptions = {};
    
    switch (settings.colorScheme) {
      case 'high-contrast':
        themeOptions = {
          palette: {
            mode: 'dark',
            primary: { main: '#ffffff' },
            secondary: { main: '#ffff00' },
            background: { default: '#000000', paper: '#000000' },
            text: { primary: '#ffffff', secondary: '#ffff00' },
          },
        };
        break;
      case 'protanopia':
        themeOptions = {
          palette: {
            primary: { main: '#0066cc' },
            secondary: { main: '#ff9900' },
            error: { main: '#cc6600' },
            warning: { main: '#ffcc00' },
            success: { main: '#0099cc' },
          },
        };
        break;
      case 'deuteranopia':
        themeOptions = {
          palette: {
            primary: { main: '#0066ff' },
            secondary: { main: '#ff6600' },
            error: { main: '#cc3300' },
            warning: { main: '#ffcc00' },
            success: { main: '#0099ff' },
          },
        };
        break;
      case 'tritanopia':
        themeOptions = {
          palette: {
            primary: { main: '#cc0066' },
            secondary: { main: '#00cc99' },
            error: { main: '#cc0000' },
            warning: { main: '#cc9900' },
            success: { main: '#00cc66' },
          },
        };
        break;
      default:
        themeOptions = settings.colorScheme === 'dark' ? { palette: { mode: 'dark' } } : {};
    }
    
    return createTheme({
      ...themeOptions,
      typography: {
        fontSize: settings.fontSize,
        fontFamily: settings.dyslexiaFriendly 
          ? '"OpenDyslexic", "Comic Sans MS", cursive' 
          : theme.typography.fontFamily,
      },
      transitions: {
        duration: {
          shortest: settings.reducedMotion ? 0 : 150,
          shorter: settings.reducedMotion ? 0 : 200,
          short: settings.reducedMotion ? 0 : 250,
          standard: settings.reducedMotion ? 0 : 300,
          complex: settings.reducedMotion ? 0 : 375,
          enteringScreen: settings.reducedMotion ? 0 : 225,
          leavingScreen: settings.reducedMotion ? 0 : 195,
        },
      },
    });
  };

  const renderSkipLinks = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        transform: skipLinksVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        p: 1,
        display: 'flex',
        gap: 1,
      }}
      onFocus={() => setSkipLinksVisible(true)}
      onBlur={() => setSkipLinksVisible(false)}
    >
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          const main = document.querySelector('main');
          if (main) main.focus();
        }}
      >
        Skip to main content
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          const nav = document.querySelector('nav');
          if (nav) nav.focus();
        }}
      >
        Skip to navigation
      </Button>
    </Box>
  );

  const renderAccessibilityPanel = () => (
    <Dialog
      open={panelOpen}
      onClose={() => setPanelOpen(false)}
      maxWidth="md"
      fullWidth
      aria-labelledby="accessibility-panel-title"
    >
      <DialogTitle id="accessibility-panel-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Accessibility Settings
          <IconButton onClick={() => setPanelOpen(false)} aria-label="Close accessibility panel">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          These settings will be saved to your browser and applied across all sessions.
        </Alert>

        <Grid container spacing={3}>
          {/* Visual Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <VisibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Visual Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Color Scheme</InputLabel>
              <Select
                value={settings.colorScheme}
                onChange={(e) => updateSettings({ colorScheme: e.target.value as AccessibilitySettings['colorScheme'] })}
                label="Color Scheme"
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="dark">Dark Mode</MenuItem>
                <MenuItem value="high-contrast">High Contrast</MenuItem>
                <MenuItem value="protanopia">Protanopia (Red-blind)</MenuItem>
                <MenuItem value="deuteranopia">Deuteranopia (Green-blind)</MenuItem>
                <MenuItem value="tritanopia">Tritanopia (Blue-blind)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              <FontSizeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Font Size: {settings.fontSize}px
            </Typography>
            <Slider
              value={settings.fontSize}
              onChange={(_, value) => updateSettings({ fontSize: value as number })}
              min={12}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
              aria-label="Font size"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                />
              }
              label="High Contrast Mode"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dyslexiaFriendly}
                  onChange={(e) => updateSettings({ dyslexiaFriendly: e.target.checked })}
                />
              }
              label="Dyslexia-Friendly Font"
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Motion Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Motion & Animation
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                />
              }
              label="Reduce Motion"
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Navigation Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Navigation & Interaction
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.keyboardNavigation}
                  onChange={(e) => updateSettings({ keyboardNavigation: e.target.checked })}
                />
              }
              label="Enhanced Keyboard Navigation"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.focusIndicators}
                  onChange={(e) => updateSettings({ focusIndicators: e.target.checked })}
                />
              }
              label="Enhanced Focus Indicators"
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Assistive Technology */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <VolumeUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Assistive Technology
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.screenReader}
                  onChange={(e) => updateSettings({ screenReader: e.target.checked })}
                />
              }
              label="Screen Reader Optimizations"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.textToSpeech}
                  onChange={(e) => updateSettings({ textToSpeech: e.target.checked })}
                />
              }
              label="Text-to-Speech"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={resetSettings} color="secondary">
                Reset to Defaults
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setPanelOpen(false);
                  announceToScreenReader('Accessibility settings saved');
                }}
              >
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );

  // Keyboard event handler for accessibility shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A: Open accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setPanelOpen(true);
        announceToScreenReader('Accessibility panel opened');
      }
      
      // Alt + C: Toggle high contrast
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        updateSettings({ highContrast: !settings.highContrast });
        announceToScreenReader(`High contrast ${!settings.highContrast ? 'enabled' : 'disabled'}`);
      }
      
      // Alt + Plus: Increase font size
      if (event.altKey && event.key === '+') {
        event.preventDefault();
        const newSize = Math.min(settings.fontSize + 1, 24);
        updateSettings({ fontSize: newSize });
        announceToScreenReader(`Font size increased to ${newSize} pixels`);
      }
      
      // Alt + Minus: Decrease font size
      if (event.altKey && event.key === '-') {
        event.preventDefault();
        const newSize = Math.max(settings.fontSize - 1, 12);
        updateSettings({ fontSize: newSize });
        announceToScreenReader(`Font size decreased to ${newSize} pixels`);
      }
    };

    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [settings.keyboardNavigation, settings.fontSize, settings.highContrast]); // Include all settings used in the effect

  const accessibilityTheme = getAccessibilityTheme();

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, announceToScreenReader }}>
      <ThemeProvider theme={accessibilityTheme}>
        {renderSkipLinks()}
        
        {children}
        
        {/* Accessibility FAB */}
        <Fab
          color="primary"
          aria-label="Open accessibility settings"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setPanelOpen(true)}
        >
          <AccessibilityIcon />
        </Fab>
        
        {renderAccessibilityPanel()}
        
        {/* Screen reader announcements */}
        <div
          id="accessibility-announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        
        {/* CSS for accessibility enhancements */}
        <style jsx global>{`
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          
          .high-contrast {
            filter: contrast(150%);
          }
          
          .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .dyslexia-friendly * {
            font-family: "OpenDyslexic", "Comic Sans MS", cursive !important;
          }
          
          .enhanced-focus *:focus {
            outline: 3px solid #005fcc !important;
            outline-offset: 2px !important;
          }
          
          .color-blind-friendly {
            /* Color blind friendly adjustments would go here */
          }
          
          @media (prefers-reduced-motion: reduce) {
            .reduced-motion * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityEnhancer; 