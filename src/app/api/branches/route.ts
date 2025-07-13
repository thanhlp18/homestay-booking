import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        rooms: {
          include: {
            timeSlots: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedBranches = branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      location: branch.location,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      description: branch.description,
      amenities: branch.amenities,
      images: branch.images,
      latitude: branch.latitude,
      longitude: branch.longitude,
      rooms: branch.rooms.map(room => ({
        id: room.id,
        name: room.name,
        slug: room.slug,
        description: room.description,
        amenities: room.amenities,
        images: room.images,
        basePrice: room.basePrice,
        discountPrice: room.discountPrice,
        originalPrice: room.originalPrice,
        location: room.location,
        area: room.area,
        capacity: room.capacity,
        bedrooms: room.bedrooms,
        bathrooms: room.bathrooms,
        features: room.features,
        policies: room.policies,
        checkIn: room.checkIn,
        checkOut: room.checkOut,
        rating: room.rating,
        reviewCount: room.reviewCount,
        timeSlots: room.timeSlots.map(slot => ({
          id: slot.id,
          time: slot.time,
          price: slot.price,
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch branches data' 
      },
      { status: 500 }
    );
  }
} 