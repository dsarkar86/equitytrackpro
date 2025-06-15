import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  TextField,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  Description as DocumentIcon,
  Search as SearchIcon,
  AddCircleOutline as AddIcon,
  FolderOpen as FolderIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  FileCopy as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as GenericFileIcon,
  Folder as FolderClosedIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Document {
  _id: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  propertyId?: string;
  propertyName?: string;
  category: string;
  tags: string[];
  uploadDate: string;
  lastModified: string;
  path: string;
  starred: boolean;
  url: string;
}

interface DocumentFolder {
  _id: string;
  name: string;
  description?: string;
  propertyId?: string;
  parentFolder?: string;
  createdDate: string;
  documentCount: number;
}

interface Property {
  _id: string;
  name: string;
  address: string;
}

interface Breadcrumb {
  id: string;
  name: string;
  isFolder: boolean;
}

const DocumentManager: React.FC = () => {
  const { propertyId, folderId } = useParams<{ propertyId?: string; folderId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Component states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Dialog states
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'document' | 'folder' | 'multiple' | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProperty, setUploadProperty] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
    itemType: 'document' | 'folder';
  } | null>(null);
  
  // Fetch documents and folders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Reset selection when changing folders
        setSelectedDocuments([]);
        setSelectedFolders([]);
        setIsMultiSelectMode(false);
        
        // Fetch user properties
        const propertiesResponse = await axios.get('/api/properties');
        setProperties(propertiesResponse.data);
        
        let documentsUrl = '/api/documents';
        let foldersUrl = '/api/document-folders';
        
        // Build query params based on property and folder
        const params: Record<string, string> = {};
        if (propertyId) {
          params.propertyId = propertyId;
          
          // Set current property
          const propertyResponse = await axios.get(`/api/properties/${propertyId}`);
          setCurrentProperty(propertyResponse.data);
        }
        
        if (folderId) {
          params.parentFolder = folderId;
          
          // Set current folder
          const folderResponse = await axios.get(`/api/document-folders/${folderId}`);
          setCurrentFolder(folderResponse.data);
          
          // Build breadcrumbs
          await buildBreadcrumbs(folderId);
        } else {
          // Root level breadcrumbs
          const initialBreadcrumbs: Breadcrumb[] = [];
          if (propertyId && currentProperty) {
            initialBreadcrumbs.push({
              id: currentProperty._id,
              name: currentProperty.name,
              isFolder: false
            });
          }
          setBreadcrumbs(initialBreadcrumbs);
        }
        
        // Add query params
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
          documentsUrl += `?${queryString}`;
          foldersUrl += `?${queryString}`;
        }
        
        // Fetch documents and folders
        const [documentsResponse, foldersResponse] = await Promise.all([
          axios.get(documentsUrl),
          axios.get(foldersUrl)
        ]);
        
        setDocuments(documentsResponse.data);
        setFolders(foldersResponse.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Documents loading error:', err);
        setLoading(false);
        toast.error('Failed to load documents');
      }
    };
    
    fetchData();
  }, [propertyId, folderId]);
  
  // Build breadcrumbs
  const buildBreadcrumbs = async (currentFolderId: string) => {
    try {
      const breadcrumbsArray: Breadcrumb[] = [];
      let folderId = currentFolderId;
      
      // Add property if present
      if (propertyId && currentProperty) {
        breadcrumbsArray.unshift({
          id: currentProperty._id,
          name: currentProperty.name,
          isFolder: false
        });
      }
      
      while (folderId) {
        const folderResponse = await axios.get(`/api/document-folders/${folderId}`);
        const folder = folderResponse.data;
        
        breadcrumbsArray.unshift({
          id: folder._id,
          name: folder.name,
          isFolder: true
        });
        
        folderId = folder.parentFolder || '';
      }
      
      setBreadcrumbs(breadcrumbsArray);
    } catch (err) {
      console.error('Error building breadcrumbs:', err);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon />;
    } else if (fileType.startsWith('text/')) {
      return <FileIcon />;
    } else {
      return <GenericFileIcon />;
    }
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter items based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (folder.description && folder.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle folder navigation
  const handleOpenFolder = (folderId: string) => {
    if (isMultiSelectMode) {
      // Toggle folder selection in multi-select mode
      handleSelectFolder(folderId);
    } else {
      // Navigate to folder
      if (propertyId) {
        navigate(`/documents/property/${propertyId}/folder/${folderId}`);
      } else {
        navigate(`/documents/folder/${folderId}`);
      }
    }
  };
  
  // Handle document selection
  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };
  
  // Handle folder selection
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };
  
  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      // Clear selections when exiting multi-select mode
      setSelectedDocuments([]);
      setSelectedFolders([]);
    }
  };
  
  // Handle document click
  const handleDocumentClick = (document: Document) => {
    if (isMultiSelectMode) {
      // Toggle document selection in multi-select mode
      handleSelectDocument(document._id);
    } else {
      // Open document preview or download
      window.open(document.url, '_blank');
    }
  };
  
  // Handle document context menu
  const handleDocumentContextMenu = (event: React.MouseEvent, document: Document) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      itemId: document._id,
      itemType: 'document'
    });
  };
  
  // Handle folder context menu
  const handleFolderContextMenu = (event: React.MouseEvent, folder: DocumentFolder) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      itemId: folder._id,
      itemType: 'folder'
    });
  };
  
  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // Handle document star toggle
  const handleToggleStar = async (documentId: string, isStarred: boolean) => {
    try {
      await axios.patch(`/api/documents/${documentId}`, {
        starred: !isStarred
      });
      
      // Update documents list
      setDocuments(docs => 
        docs.map(doc => 
          doc._id === documentId ? { ...doc, starred: !isStarred } : doc
        )
      );
      
      toast.success(isStarred ? 'Removed from starred' : 'Added to starred');
    } catch (err) {
      console.error('Error toggling star:', err);
      toast.error('Failed to update document');
    }
  };
  
  // Handle document download
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc._id === documentId);
      if (document) {
        window.open(document.url, '_blank');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirmation = (itemId: string, itemType: 'document' | 'folder') => {
    setDeleteItemId(itemId);
    setDeleteItemType(itemType);
    setDeleteDialog(true);
    handleCloseContextMenu();
  };
  
  // Handle multiple delete confirmation
  const handleMultipleDeleteConfirmation = () => {
    setDeleteItemType('multiple');
    setDeleteDialog(true);
  };
  
  // Handle delete
  const handleDelete = async () => {
    try {
      if (deleteItemType === 'document' && deleteItemId) {
        await axios.delete(`/api/documents/${deleteItemId}`);
        setDocuments(docs => docs.filter(doc => doc._id !== deleteItemId));
        toast.success('Document deleted successfully');
      } else if (deleteItemType === 'folder' && deleteItemId) {
        await axios.delete(`/api/document-folders/${deleteItemId}`);
        setFolders(folders => folders.filter(folder => folder._id !== deleteItemId));
        toast.success('Folder deleted successfully');
      } else if (deleteItemType === 'multiple') {
        // Delete multiple items
        const promises = [];
        
        // Delete selected documents
        for (const docId of selectedDocuments) {
          promises.push(axios.delete(`/api/documents/${docId}`));
        }
        
        // Delete selected folders
        for (const folderId of selectedFolders) {
          promises.push(axios.delete(`/api/document-folders/${folderId}`));
        }
        
        await Promise.all(promises);
        
        // Update state
        setDocuments(docs => docs.filter(doc => !selectedDocuments.includes(doc._id)));
        setFolders(folders => folders.filter(folder => !selectedFolders.includes(folder._id)));
        
        // Clear selection
        setSelectedDocuments([]);
        setSelectedFolders([]);
        setIsMultiSelectMode(false);
        
        toast.success('Items deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item');
    } finally {
      setDeleteDialog(false);
      setDeleteItemId(null);
      setDeleteItemType(null);
    }
  };
  
  // Handle new folder dialog open
  const handleNewFolderDialog = () => {
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderDialog(true);
  };
  
  // Handle create folder
  const handleCreateFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        toast.error('Folder name is required');
        return;
      }
      
      const folderData = {
        name: newFolderName,
        description: newFolderDescription,
        propertyId: propertyId || undefined,
        parentFolder: folderId || undefined
      };
      
      const response = await axios.post('/api/document-folders', folderData);
      
      // Add new folder to state
      setFolders(prev => [...prev, response.data]);
      
      setNewFolderDialog(false);
      toast.success('Folder created successfully');
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error('Failed to create folder');
    }
  };
  
  // Handle upload dialog open
  const handleUploadDialog = () => {
    setUploadCategory('general');
    setUploadTags([]);
    setUploadDescription('');
    setUploadProperty(propertyId || '');
    setUploadFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadDialog(true);
  };
  
  // Handle file selection
  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setUploadFiles(filesArray);
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('description', uploadDescription);
        formData.append('category', uploadCategory);
        uploadTags.forEach(tag => formData.append('tags', tag));
        if (uploadProperty) {
          formData.append('propertyId', uploadProperty);
        }
        if (folderId) {
          formData.append('parentFolder', folderId);
        }
        
        const response = await axios.post('/api/documents/upload', formData, {
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(percentCompleted);
          }
        });
        
        // Add new document to state
        setDocuments(prev => [...prev, response.data]);
        
        // Update progress
        setUploadProgress(((i + 1) / uploadFiles.length) * 100);
      }
      
      setUploadDialog(false);
      toast.success('Documents uploaded successfully');
    } catch (err) {
      console.error('Error uploading documents:', err);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Main loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DocumentIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Document Manager
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {currentProperty 
                ? `Documents for ${currentProperty.name}` 
                : 'Manage all your property documents'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentProperty && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to={`/properties/${currentProperty._id}`}
            >
              Back to Property
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={handleUploadDialog}
          >
            Upload Documents
          </Button>
        </Box>
      </Box>
      
      {/* Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            component={Link}
            to={propertyId ? `/documents/property/${propertyId}` : '/documents'}
            size="small"
          >
            <HomeIcon />
          </IconButton>
          
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              <NavigateNextIcon fontSize="small" color="action" sx={{ mx: 1 }} />
              {index === breadcrumbs.length - 1 ? (
                <Typography variant="body2" fontWeight="medium">
                  {breadcrumb.name}
                </Typography>
              ) : (
                <Button
                  variant="text"
                  size="small"
                  component={Link}
                  to={
                    breadcrumb.isFolder
                      ? propertyId
                        ? `/documents/property/${propertyId}/folder/${breadcrumb.id}`
                        : `/documents/folder/${breadcrumb.id}`
                      : `/documents/property/${breadcrumb.id}`
                  }
                >
                  {breadcrumb.name}
                </Button>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
      
      {/* Action Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search documents and folders..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={handleNewFolderDialog}
              >
                New Folder
              </Button>
              <Button
                variant={isMultiSelectMode ? 'contained' : 'outlined'}
                color={isMultiSelectMode ? 'primary' : 'inherit'}
                onClick={toggleMultiSelectMode}
              >
                {isMultiSelectMode ? 'Exit Selection' : 'Select Multiple'}
              </Button>
              {isMultiSelectMode && (selectedDocuments.length > 0 || selectedFolders.length > 0) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleMultipleDeleteConfirmation}
                >
                  Delete Selected
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Content tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="All Items" />
        <Tab 
          label={
            <Badge badgeContent={documents.filter(doc => doc.starred).length} color="primary">
              Starred
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={properties.length} color="primary">
              By Property
            </Badge>
          } 
        />
      </Tabs>
      
      {/* All Items Tab */}
      <Box hidden={activeTab !== 0} sx={{ mb: 4 }}>
        {folders.length === 0 && documents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Documents or Folders
            </Typography>
            <Typography variant="body1" paragraph>
              Start by creating a folder or uploading documents
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={handleNewFolderDialog}
              >
                New Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleUploadDialog}
              >
                Upload Documents
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Folders section */}
            {filteredFolders.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Folders
                </Typography>
                <Grid container spacing={2}>
                  {filteredFolders.map(folder => (
                    <Grid item xs={12} sm={6} md={4} key={folder._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          border: selectedFolders.includes(folder._id) ? 2 : 1,
                          borderColor: selectedFolders.includes(folder._id) ? 'primary.main' : 'divider',
                          bgcolor: selectedFolders.includes(folder._id) ? 'primary.light' : 'background.paper'
                        }}
                        onClick={() => handleOpenFolder(folder._id)}
                        onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <FolderClosedIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" noWrap>
                                {folder.name}
                              </Typography>
                              {folder.description && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {folder.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary" display="block">
                                {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(folder.createdDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Documents section */}
            {filteredDocuments.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Documents
                </Typography>
                <Grid container spacing={2}>
                  {filteredDocuments.map(document => (
                    <Grid item xs={12} sm={6} md={4} key={document._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          border: selectedDocuments.includes(document._id) ? 2 : 1,
                          borderColor: selectedDocuments.includes(document._id) ? 'primary.main' : 'divider',
                          bgcolor: selectedDocuments.includes(document._id) ? 'primary.light' : 'background.paper'
                        }}
                        onClick={() => handleDocumentClick(document)}
                        onContextMenu={(e) => handleDocumentContextMenu(e, document)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            {getFileIcon(document.fileType)}
                            <Box sx={{ flexGrow: 1, ml: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1 }}>
                                  {document.name}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStar(document._id, document.starred);
                                  }}
                                >
                                  {document.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                </IconButton>
                              </Box>
                              
                              {document.description && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {document.description}
                                </Typography>
                              )}
                              
                              <Typography variant="caption" color="text.secondary" display="block">
                                {formatFileSize(document.fileSize)}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary" display="block">
                                Modified: {formatDate(document.lastModified)}
                              </Typography>
                              
                              {document.propertyName && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Property: {document.propertyName}
                                </Typography>
                              )}
                              
                              <Box sx={{ mt: 1 }}>
                                {document.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Empty search results */}
            {searchQuery && filteredFolders.length === 0 && filteredDocuments.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No Results Found
                </Typography>
                <Typography variant="body1">
                  No documents or folders match your search criteria.
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
      
      {/* Starred Tab */}
      <Box hidden={activeTab !== 1} sx={{ mb: 4 }}>
        {documents.filter(doc => doc.starred).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Starred Documents
            </Typography>
            <Typography variant="body1">
              Star your important documents to access them quickly.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {documents
              .filter(doc => doc.starred)
              .map(document => (
                <Grid item xs={12} sm={6} md={4} key={document._id}>
                  <Card 
                    sx={{ height: '100%', cursor: 'pointer' }}
                    onClick={() => handleDocumentClick(document)}
                    onContextMenu={(e) => handleDocumentContextMenu(e, document)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        {getFileIcon(document.fileType)}
                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1 }}>
                              {document.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(document._id, document.starred);
                              }}
                            >
                              <StarIcon color="warning" />
                            </IconButton>
                          </Box>
                          
                          {document.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {document.description}
                            </Typography>
                          )}
                          
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatFileSize(document.fileSize)}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary" display="block">
                            Modified: {formatDate(document.lastModified)}
                          </Typography>
                          
                          {document.propertyName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Property: {document.propertyName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Box>
      
      {/* By Property Tab */}
      <Box hidden={activeTab !== 2} sx={{ mb: 4 }}>
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Properties Found
            </Typography>
            <Typography variant="body1" paragraph>
              Add properties to organize your documents by property.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/properties/add"
              startIcon={<AddIcon />}
            >
              Add Property
            </Button>
          </Paper>
        ) : (
          <List>
            {properties.map(property => (
              <ListItem 
                key={property._id} 
                component={Paper} 
                sx={{ mb: 2, p: 0 }}
              >
                <ListItemButton 
                  component={Link} 
                  to={`/documents/property/${property._id}`}
                >
                  <ListItemIcon>
                    <HomeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={property.name} 
                    secondary={property.address}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.itemType === 'document' && (
          <>
            <MenuItem onClick={() => {
              if (contextMenu) {
                const document = documents.find(doc => doc._id === contextMenu.itemId);
                if (document) {
                  handleToggleStar(document._id, document.starred);
                }
              }
              handleCloseContextMenu();
            }}>
              {documents.find(doc => doc._id === contextMenu?.itemId)?.starred ? 
                <><StarBorderIcon fontSize="small" sx={{ mr: 1 }} /> Remove Star</> : 
                <><StarIcon fontSize="small" sx={{ mr: 1 }} /> Add Star</>
              }
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleDownloadDocument(contextMenu.itemId);
              }
              handleCloseContextMenu();
            }}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleDeleteConfirmation(contextMenu.itemId, 'document');
              }
            }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </>
        )}
        
        {contextMenu?.itemType === 'folder' && (
          <>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleOpenFolder(contextMenu.itemId);
              }
              handleCloseContextMenu();
            }}>
              <FolderOpenIcon fontSize="small" sx={{ mr: 1 }} /> Open
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleDeleteConfirmation(contextMenu.itemId, 'folder');
              }
            }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* New Folder Dialog */}
      <Dialog
        open={newFolderDialog}
        onClose={() => setNewFolderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create Folder</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteItemType === 'document' ? (
              'Are you sure you want to delete this document? This action cannot be undone.'
            ) : deleteItemType === 'folder' ? (
              'Are you sure you want to delete this folder and all its contents? This action cannot be undone.'
            ) : (
              `Are you sure you want to delete ${selectedDocuments.length} document(s) and ${selectedFolders.length} folder(s)? This action cannot be undone.`
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => !isUploading && setUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
                onClick={handleFileSelection}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleFileChange}
                />
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Click to select files or drag and drop files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported file types: PDF, Images, Documents
                </Typography>
              </Box>
            </Grid>
            
            {uploadFiles.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({uploadFiles.length})
                </Typography>
                <List dense>
                  {uploadFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name} 
                        secondary={formatFileSize(file.size)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Document Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={uploadCategory}
                      label="Category"
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="financial">Financial</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="legal">Legal</MenuItem>
                      <MenuItem value="insurance">Insurance</MenuItem>
                      <MenuItem value="valuation">Valuation</MenuItem>
                      <MenuItem value="utility">Utility</MenuItem>
                      <MenuItem value="tax">Tax</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Property (Optional)</InputLabel>
                    <Select
                      value={uploadProperty}
                      label="Property (Optional)"
                      onChange={(e) => setUploadProperty(e.target.value)}
                      disabled={!!propertyId}
                    >
                      <MenuItem value="">None</MenuItem>
                      {properties.map(property => (
                        <MenuItem key={property._id} value={property._id}>
                          {property.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Tags (comma separated)"
                    fullWidth
                    placeholder="e.g. important, tax, 2025"
                    value={uploadTags.join(', ')}
                    onChange={(e) => setUploadTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {isUploading && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(uploadProgress)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialog(false)} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={uploadFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentManager;