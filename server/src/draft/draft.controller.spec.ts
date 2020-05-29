import { Test, TestingModule } from '@nestjs/testing';
import { DraftController } from './draft.controller';

describe('Draft Controller', () => {
  let controller: DraftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DraftController],
    }).compile();

    controller = module.get<DraftController>(DraftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
