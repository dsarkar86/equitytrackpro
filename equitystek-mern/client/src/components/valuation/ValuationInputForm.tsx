import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Grid,
  Alert,
  Slider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Money as MoneyIcon,
  Source as SourceIcon,
  Description as DescriptionIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { format, isAfter, isBefore, isValid, parse } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema for the form
const valuationSchema = z.object({
  date: z.string()
    .refine(val => {
      const parsedDate = parse(val, 'yyyy-MM-dd', new Date());
      return isValid(parsedDate) && !isAfter(parsedDate, new Date());
    }, { message: 'Date must be valid and not in the future' }),
  value: z.number()
    .min(1, { message: 'Value must be greater than 0' })
    .refine(val => !isNaN(val), { message: 'Please enter a valid number' }),
  source: z.enum(['professional', 'automated', 'manual']),
  notes: z.string().optional()
});

type ValuationFormData = z.infer<typeof valuationSchema>;

interface ValuationInputFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ValuationFormData) => Promise<void>;
  propertyPurchasePrice?: number;
  lastValuation?: number;
  loading?: boolean;
}

const ValuationInputForm: React.FC<ValuationInputFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  propertyPurchasePrice = 0,
  lastValuation,
  loading = false
}) => {
  const [sliderValue, setSliderValue] = useState<number>(lastValuation || propertyPurchasePrice || 500000);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Get today's date formatted for the date input
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate suggested valuation range (90% - 110% of last valuation or purchase price)
  const baseValue = lastValuation || propertyPurchasePrice;
  const minSuggestedValue = baseValue * 0.9;
  const maxSuggestedValue = baseValue * 1.1;
  
  // Calculate percentage change from previous valuation
  const calculatePercentageChange = (newValue: number) => {
    if (!baseValue) return 0;
    return ((newValue - baseValue) / baseValue) * 100;
  };
  
  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      date: today,
      value: lastValuation || propertyPurchasePrice || 500000,
      source: 'manual',
      notes: ''
    }
  });
  
  // Watch the current value to show real-time feedback
  const currentValue = watch('value');
  const percentageChange = calculatePercentageChange(currentValue || 0);
  const isPositiveChange = percentageChange >= 0;
  
  // Handle slider change
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setSliderValue(value);
    setValue('value', value);
  };
  
  // Check if value is outside of suggested range and show confirmation
  const checkValueRange = (data: ValuationFormData) => {
    if (baseValue && (data.value < minSuggestedValue || data.value > maxSuggestedValue)) {
      setConfirmDialogOpen(true);
    } else {
      submitForm(data);
    }
  };
  
  // Submit the form data
  const submitForm = async (data: ValuationFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting valuation:", error);
      // Error will be handled by the parent component
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <MoneyIcon color="primary" sx={{ mr: 1 }} />
            Add New Property Valuation
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details of your property valuation. For the most accurate records,
            use professional appraisals when available.
          </DialogContentText>
          
          {baseValue > 0 && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              icon={<SourceIcon />}
            >
              {lastValuation ? 
                `Previous valuation: ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(lastValuation)}` 
                : 
                `Purchase price: ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(propertyPurchasePrice)}`
              }
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(checkValueRange)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valuation Date"
                      type="date"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.source}>
                      <InputLabel>Source</InputLabel>
                      <Select
                        {...field}
                        startAdornment={
                          <InputAdornment position="start">
                            <SourceIcon />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="professional">Professional Appraisal</MenuItem>
                        <MenuItem value="automated">Automated Estimate</MenuItem>
                        <MenuItem value="manual">Manual Entry</MenuItem>
                      </Select>
                      <FormHelperText>{errors.source?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Property Value
                  </Typography>
                  <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TextField
                          {...field}
                          type="number"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MoneyIcon />
                                $
                              </InputAdornment>
                            ),
                          }}
                          error={!!errors.value}
                          helperText={errors.value?.message}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value);
                            setSliderValue(value || 0);
                          }}
                        />
                        {baseValue > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {isPositiveChange ? (
                              <ArrowUpwardIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                            ) : (
                              <ArrowDownwardIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              color={isPositiveChange ? 'success.main' : 'error.main'}
                            >
                              {percentageChange.toFixed(2)}% {isPositiveChange ? 'increase' : 'decrease'} from {lastValuation ? 'previous valuation' : 'purchase price'}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  />
                </Box>
                
                {baseValue > 0 && (
                  <Box sx={{ px: 2, mb: 3 }}>
                    <Slider
                      value={sliderValue}
                      onChange={handleSliderChange}
                      min={Math.max(baseValue * 0.7, 1000)}
                      max={baseValue * 1.3}
                      step={1000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => 
                        new Intl.NumberFormat('en-AU', { 
                          style: 'currency', 
                          currency: 'AUD',
                          maximumFractionDigits: 0 
                        }).format(value)
                      }
                      marks={[
                        { value: baseValue * 0.9, label: '-10%' },
                        { value: baseValue, label: baseValue === lastValuation ? 'Last' : 'Purchase' },
                        { value: baseValue * 1.1, label: '+10%' },
                      ]}
                    />
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Add any additional notes or information about this valuation..."
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Saving...' : 'Add Valuation'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog for unusual values */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Valuation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The valuation you entered is {currentValue < minSuggestedValue ? 'significantly lower' : 'significantly higher'} than
            the {lastValuation ? 'previous valuation' : 'purchase price'} 
            ({Math.abs(percentageChange).toFixed(1)}% {currentValue < minSuggestedValue ? 'decrease' : 'increase'}).
            
            Are you sure this is correct?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Review Entry
          </Button>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              const formData = watch();
              submitForm(formData);
            }} 
            variant="contained" 
            color="primary"
          >
            Confirm Value
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValuationInputForm;