'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ListingEditSkeleton } from '@/components/ui/skeletons';
import { toast } from 'sonner';
import { getListingForEdit } from '@/lib/actions/listings';
import ListingBuilder from '@/components/seller/listing-builder';

export default function EditListingPage() {
  const t = useTranslations('sellerListings');
  const params = useParams();
  const listingId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState<Awaited<ReturnType<typeof getListingForEdit>>['data'] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getListingForEdit(listingId);
        if (result.success && result.data) {
          setListing(result.data);
        } else {
          toast.error(result.error || t('listingNotFound'));
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        toast.error(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [listingId, t]);

  if (isLoading) {
    return <ListingEditSkeleton />;
  }

  if (!listing) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('listingNotFound')}</h1>
        <p className="text-muted-foreground mb-6">{t('listingNotFoundDesc')}</p>
        <Button asChild>
          <Link href="/seller/inserate">{t('backToListings')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <ListingBuilder
      listing={{
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        status: listing.status,
        manufacturer_id: listing.manufacturer_id,
        model_name_custom: listing.model_name_custom,
        year_built: listing.year_built,
        condition: listing.condition,
        machine_type: listing.machine_type,
        price: listing.price,
        price_negotiable: listing.price_negotiable,
        measuring_range_x: listing.measuring_range_x,
        measuring_range_y: listing.measuring_range_y,
        measuring_range_z: listing.measuring_range_z,
        accuracy_um: listing.accuracy_um,
        software: listing.software,
        controller: listing.controller,
        probe_system: listing.probe_system,
        weight_kg: listing.weight_kg,
        dimension_length_mm: listing.dimension_length_mm,
        dimension_width_mm: listing.dimension_width_mm,
        dimension_height_mm: listing.dimension_height_mm,
        mpn: listing.mpn,
        gtin: listing.gtin,
        serial_number: listing.serial_number,
        location_country: listing.location_country,
        location_city: listing.location_city,
        location_postal_code: listing.location_postal_code,
        description: listing.description,
        media: (listing.media || []).map((m) => ({
          id: m.id,
          url: m.url,
          thumbnail_url: m.thumbnail_url,
          is_primary: m.is_primary,
          type: m.type,
          filename: m.filename,
        })),
        manufacturer: listing.manufacturer,
      }}
    />
  );
}
