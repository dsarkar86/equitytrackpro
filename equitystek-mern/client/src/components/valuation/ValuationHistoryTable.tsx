import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
  TableSortLabel,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Valuation {
  _id: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
  notes?: string;
  changePercentage?: number;
  changeValue?: number;
}

interface ValuationHistoryTableProps {
  valuations: Valuation[];
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
  loading?: boolean;
  deleteLoading?: boolean;
}

type Order = 'asc' | 'desc';
type SortField = 'date' | 'value' | 'source' | 'changePercentage';

const ValuationHistoryTable: React.FC<ValuationHistoryTableProps> = ({
  valuations,
  onDelete,
  onAdd,
  loading = false,
  deleteLoading = false
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<SortField>('date');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<string | null>(null);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  // Handle sorting
  const handleRequestSort = (property: SortField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Sort function
  const sortFunction = (a: Valuation, b: Valuation, orderBy: SortField): number => {
    switch (orderBy) {
      case 'date':
        return order === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'value':
        return order === 'asc' ? a.value - b.value : b.value - a.value;
      case 'source':
        return order === 'asc'
          ? a.source.localeCompare(b.source)
          : b.source.localeCompare(a.source);
      case 'changePercentage':
        const aChange = a.changePercentage || 0;
        const bChange = b.changePercentage || 0;
        return order === 'asc' ? aChange - bChange : bChange - aChange;
      default:
        return 0;
    }
  };
  
  // Filter and sort valuations
  const sortedValuations = [...valuations].sort((a, b) => sortFunction(a, b, orderBy));
  
  // Get source display name
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'professional':
        return 'Professional Appraisal';
      case 'automated':
        return 'Automated Estimate';
      case 'manual':
        return 'Manual Entry';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };
  
  // Get source color
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'professional':
        return 'primary';
      case 'automated':
        return 'info';
      case 'manual':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (valuationToDelete) {
      await onDelete(valuationToDelete);
      setDeleteDialogOpen(false);
      setValuationToDelete(null);
    }
  };
  
  // Show delete dialog
  const showDeleteDialog = (id: string) => {
    setValuationToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // If loading, show placeholder content
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              Valuation History
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              disabled
            >
              Add Valuation
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Valuation History
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add Valuation
          </Button>
        </Box>
        
        {valuations.length > 0 ? (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="medium" aria-label="valuation history table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'date'}
                        direction={orderBy === 'date' ? order : 'asc'}
                        onClick={() => handleRequestSort('date')}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'value'}
                        direction={orderBy === 'value' ? order : 'asc'}
                        onClick={() => handleRequestSort('value')}
                      >
                        Valuation
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'changePercentage'}
                        direction={orderBy === 'changePercentage' ? order : 'asc'}
                        onClick={() => handleRequestSort('changePercentage')}
                      >
                        Change
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'source'}
                        direction={orderBy === 'source' ? order : 'asc'}
                        onClick={() => handleRequestSort('source')}
                      >
                        Source
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedValuations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((valuation) => (
                      <TableRow key={valuation._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {formatDate(valuation.date)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {formatCurrency(valuation.value)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(valuation.changePercentage !== undefined && valuation.changeValue !== undefined) ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {valuation.changePercentage > 0 ? (
                                <TrendingUpIcon 
                                  fontSize="small" 
                                  sx={{ mr: 0.5, color: 'success.main' }} 
                                />
                              ) : valuation.changePercentage < 0 ? (
                                <TrendingDownIcon 
                                  fontSize="small" 
                                  sx={{ mr: 0.5, color: 'error.main' }} 
                                />
                              ) : null}
                              <Typography 
                                variant="body2"
                                color={
                                  valuation.changePercentage > 0 
                                    ? 'success.main' 
                                    : valuation.changePercentage < 0 
                                      ? 'error.main' 
                                      : 'text.secondary'
                                }
                              >
                                {valuation.changePercentage.toFixed(2)}% ({formatCurrency(valuation.changeValue)})
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Initial valuation
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getSourceDisplayName(valuation.source)} 
                            size="small"
                            color={getSourceColor(valuation.source) as any}
                            variant={valuation.source === 'professional' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          {valuation.notes ? (
                            <Tooltip title={valuation.notes}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <DescriptionIcon 
                                  fontSize="small" 
                                  sx={{ mr: 0.5, color: 'text.secondary' }} 
                                />
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                                  {valuation.notes}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No notes
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete valuation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => showDeleteDialog(valuation._id)}
                              disabled={deleteLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={valuations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'background.default' 
            }}
          >
            <Typography variant="body1" paragraph color="text.secondary">
              No valuation records found for this property.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
            >
              Add First Valuation
            </Button>
          </Paper>
        )}
      </CardContent>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Valuation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this valuation record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ValuationHistoryTable;