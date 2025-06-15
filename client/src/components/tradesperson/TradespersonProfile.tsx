import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Loader2, Phone, Mail, Star, Award, Calendar, Wrench } from "lucide-react";

interface TradespersonProfileProps {
  tradespersonId: number;
}

export default function TradespersonProfile({ tradespersonId }: TradespersonProfileProps) {
  const { data: tradesperson, isLoading, error } = useQuery<User>({
    queryKey: [`/api/users/${tradespersonId}`],
    // Only fetch if we have a valid tradespersonId
    enabled: !!tradespersonId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tradesperson) {
    return (
      <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300">Tradesperson Not Found</CardTitle>
          <CardDescription>Unable to load tradesperson information.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={tradesperson.profileImageUrl || ""} alt={tradesperson.name || tradesperson.username} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {(tradesperson.name || tradesperson.username || "").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{tradesperson.name || tradesperson.username}</CardTitle>
            <CardDescription>{tradesperson.specialty || "General Maintenance"}</CardDescription>
            <div className="mt-1 flex gap-1">
              <Badge variant="outline" className="bg-primary/10">
                <Wrench className="h-3 w-3 mr-1" />
                {tradesperson.role}
              </Badge>
              {tradesperson.verified && (
                <Badge className="bg-green-500">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {tradesperson.experience && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{tradesperson.experience} Years Experience</span>
            </div>
          )}
          {tradesperson.rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-amber-500" />
              <span>
                <strong>{tradesperson.rating}</strong>/5 Rating
              </span>
            </div>
          )}
          {tradesperson.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{tradesperson.phoneNumber}</span>
            </div>
          )}
          {tradesperson.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{tradesperson.email}</span>
            </div>
          )}
          {tradesperson.licenseInfo && (
            <div className="mt-2 text-sm">
              <p className="text-muted-foreground">License Information:</p>
              <p className="font-medium">{tradesperson.licenseInfo}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}