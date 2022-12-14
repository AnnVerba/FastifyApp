import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './models/movie.model';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
//import { ConsumeMessage } from 'amqplib';
@Controller('movie')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards()
  @RabbitRPC({
    routingKey: 'user.info',
    exchange: 'exchange1',
    queue: 'hello',
  })
  async createMovie(@Body() body: any): Promise<Movie> {
    if (!body) {
      console.log(body.name);
      console.log(body);
      return null;
    }
    try {
      const movie = await this.movieService.createRow(body);
      this.amqpConnection.publish('exchange1', 'user.info', {
        msg: movie,
      });

      return movie;
    } catch (e) {
      return e;
    }
  }

  @Put(':id')
  async updateMovie(@Body() body: any, @Param('id') id: number) {
    try {
      return await this.movieService.upDateRow(body, id);
    } catch (err) {
      return err;
    }
  }

  @Delete(':id')
  async deleteMovie(@Param('id') id: number): Promise<any> {
    try {
      return await this.movieService.deleteMovie(id);
    } catch (err) {
      return err;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards()
  async getMovieById(@Param('id') id: number): Promise<Movie> {
    try {
      return await this.movieService.getMovieById(id);
    } catch (err) {
      return err;
    }
  }

  @Get(':search/:value')
  @ApiBearerAuth()
  @UseGuards()
  async search(@Param() params): Promise<Movie[]> {
    return await this.movieService.searchByAll(params.search, params.value);
  }

  @Get()
  async getMovies(): Promise<Movie[]> {
    try {
    const movie=await this.movieService.getAllMovies();
      this.amqpConnection.publish('exchange1', 'user.info', {
        msg: movie,
      });
      return movie
    } catch (err) {
      return err;
    }
  }
  @RabbitSubscribe({
    routingKey: 'user.info',
    exchange: 'exchange1',
    queue: 'hello',
  })
  obtainMessage(data: any) {
        console.log(`Received pub/sub message: ${JSON.stringify(data)}`);
  }
}
