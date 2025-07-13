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
      rooms: branch.rooms.map(room => ({
        id: room.id,
        name: room.name,
        slug: room.slug,
        description: room.description,
        amenities: room.amenities,
        price: {
          base: 179000, // Default price, you can adjust based on your needs
          discount: 44,
          originalPrice: 319000,
        },
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