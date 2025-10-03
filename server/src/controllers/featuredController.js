import { getFeaturedContent } from '../services/featuredService.js';

export async function getFeatured(req, res) {
  try {
    const featured = await getFeaturedContent();
    res.json(featured);
  } catch (error) {
    console.error('Featured error:', error.message);
    res.status(500).json({ message: 'Failed to load featured content' });
  }
}