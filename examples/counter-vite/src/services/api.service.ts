export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export class ApiService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
  
  async fetchUser(id: number): Promise<User> {
    await this.delay(300);
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return response.json();
  }
  
  async fetchPosts(): Promise<Post[]> {
    await this.delay(500);
    const response = await fetch(`${this.baseUrl}/posts?_limit=5`);
    return response.json();
  }
  
  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    await this.delay(300);
    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });
    return response.json();
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  onInit() {
    console.log('ApiService initialized');
  }
}

