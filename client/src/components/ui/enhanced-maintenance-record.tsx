import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  Tool,
  User as UserIcon
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getTradespersonDisplayName } from "@/lib/utils";
import TradespersonProfile from "@/components/tradesperson/TradespersonProfile";
import { MaintenanceRecord } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface EnhancedMaintenanceRecordProps {
  record: MaintenanceRecord;
  onDelete?: (id: number) => void;
  onEdit?: (record: MaintenanceRecord) => void;
}

export default function EnhancedMaintenanceRecord({ 
  record, 
  onDelete, 
  onEdit 
}: EnhancedMaintenanceRecordProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Format the completion date
  const formattedDate = record.completedDate 
    ? format(new Date(record.completedDate), 'dd MMM yyyy')
    : 'Date not available';
  
  // Get status color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-500";
    switch (status.toLowerCase()) {
      case 'completed': return "bg-green-500";
      case 'scheduled': return "bg-blue-500";
      case 'pending': return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string | null) => {
    if (!priority) return "bg-gray-300 text-gray-700";
    switch (priority.toLowerCase()) {
      case 'high': return "bg-red-100 text-red-700 border-red-300";
      case 'medium': return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case 'low': return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Parse image URLs
  const imageUrls = record.imageUrls 
    ? (typeof record.imageUrls === 'string' ? JSON.parse(record.imageUrls) : record.imageUrls) 
    : [];

  const hasImages = Array.isArray(imageUrls) && imageUrls.length > 0;
  
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{record.title}</CardTitle>
            <CardDescription>
              Category: {record.category.replace('_', ' ')}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {record.status && (
              <Badge className={getStatusColor(record.status)}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge>
            )}
            {record.priority && (
              <Badge variant="outline" className={getPriorityColor(record.priority)}>
                {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)} Priority
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>${record.cost ? record.cost.toFixed(2) : '0.00'}</span>
          </div>
        </div>
        
        {/* Tradesperson information - shown if available */}
        {record.tradePersonId && (
          <div className="flex items-center mt-2 mb-3 bg-primary/5 p-2 rounded-md">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback className="bg-primary/30 text-xs">TP</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center text-sm">
              <UserIcon className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>
                Completed by: 
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 pl-1 font-medium">
                      {getTradespersonDisplayName(record.tradePersonId)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px]">
                    <TradespersonProfile tradespersonId={record.tradePersonId} />
                  </DialogContent>
                </Dialog>
              </span>
            </div>
          </div>
        )}
        
        {/* Description - collapsible */}
        {record.description && (
          <>
            <p className={expanded ? "mt-2 text-sm" : "mt-2 text-sm line-clamp-2"}>
              {record.description}
            </p>
            {record.description.length > 100 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 h-8 px-2 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            )}
          </>
        )}
        
        {/* Display image count if there are images */}
        {hasImages && (
          <Badge variant="outline" className="mt-2 text-xs">
            <ImageIcon className="h-3 w-3 mr-1" />
            {imageUrls.length} Image{imageUrls.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
      
      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2 pt-0">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(record)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(record.id)}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}