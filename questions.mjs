import { Router } from "express";
import connectionPool from "./utils/db.mjs";
import { validateCreateQuestionData } from "./middleware/questionValidation.mjs";
import { validateEditQuestionData } from "./middleware/questionValidation.mjs";
import { validateCreateAnswerData } from "./middleware/post.answersValidation.mjs";

const questionsRouter = Router();


/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions with optional filtering by title and category using wildcard matching
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title (optional)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (optional)
 *     responses:
 *       '200':
 *         description: Successfully retrieved the search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved the search results.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Questions'
 *       '400':
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters.
 *       '500':
 *         description: Cannot get questions due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot get questions due to database connection.
 */
questionsRouter.get("/search", async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;
  const titlePattern = `%${title}%`
  const categoryPattern = `%${category}%`

  let result;
  

  try {
    result = await connectionPool.query(
      `select * from questions
      where title like $1 
      or category like $2
          `,
      [titlePattern, categoryPattern]

    );
  } catch (error) {
    return res.status(500).json({
      message: "Cannot get questions due to database connection.",
    });
  }

  if(result.rows.length === 0){
    return res.status(404).json({
      message: "Search Not found. Please check your parameter.",
    })

  };
  return res.status(200).json({
    message: "Successfully retrieved the search results.",
    data: result.rows,
  });
});
/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question created successfully.
 *       '400':
 *         description: Missing or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid request data.
 *       '500':
 *         description: Cannot create a new question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot create a new question due to database connection.
 */
questionsRouter.post("/", [validateCreateQuestionData], async (req, res) => {
  const newQuestion = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };

  if (!newQuestion.title || !newQuestion.description || !newQuestion.category) {
    return res.status(400).json({
      message: "Missing or invalid request data.",
    });
  }

  try {
    await connectionPool.query(
      `insert into questions (title,description,category,created_at,updated_at)
        values ($1,$2,$3,$4,$5)`,
      [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
        newQuestion.created_at,
        newQuestion.updated_at,
      ]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Cannot create a new question due to database connection.",
    });
  }
  return res.status(201).json({
    message: "Question created successfully.",
  });
});
/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved the list of questions
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "What is OpenAPI?"
 *                       description:
 *                         type: string
 *                         example: "OpenAPI is a specification for..."
 *                       category:
 *                         type: string
 *                         example: "Technology"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-27T12:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-27T12:00:00Z"
 *       '500':
 *         description: Cannot retrieve questions due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot retrieve questions due to database connection.
 */
questionsRouter.get("/", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`select * from questions`);
  } catch (error) {
    return res.status(500).json({
      message: "Cannot retrieved questions due to database connection.",
    });
  }
  return res.status(200).json({
    message: "Successfully retrieved the list of questions",
    data: result.rows,
  });
});
/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve
 *     responses:
 *       '200':
 *         description: Successfully retrieved the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved the question
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "What is OpenAPI?"
 *                     description:
 *                       type: string
 *                       example: "OpenAPI is a specification for..."
 *                     category:
 *                       type: string
 *                       example: "Technology"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
 *       '500':
 *         description: Cannot retrieve question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot retrieve question due to database connection.
 */
questionsRouter.get("/:id", async (req, res) => {
  let questionIdFromClient = req.params.id;
  let result;
  try {
    result = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "server could not read question because database connection",
    });
  }
  if (result.rows.length === 0) {
    return res.status(404).json({
      message: "Question not found",
    });
  }

  return res.status(200).json({
    message: "Successfully retrieved the question",
    data: result.rows[0],
  });
});
/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully updated the question
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
 *       '500':
 *         description: Cannot update question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot update question due to database connection.
 */
questionsRouter.put("/:id", [validateEditQuestionData], async (req, res) => {
  const putIdFromClient = req.params.id;
  let updatedQuestion = { ...req.body, updated_at: new Date() };
  let result;
  try {
    result = await connectionPool.query(
      `select * from questions where id = $1`,
      [putIdFromClient]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await connectionPool.query(
      `update questions 
        set title = $2, 
            description = $3, 
            category = $4,
            updated_at = $5 
        where id = $1`,
      [
        putIdFromClient,
        updatedQuestion.title,
        updatedQuestion.description,
        updatedQuestion.category,
        updatedQuestion.updated_at,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not update a question because database connection",
    });
  }

  return res.status(200).json({
    message: "Successfully updated the question.",
  });
});
/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to delete
 *     responses:
 *       '200':
 *         description: Question and its answers deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question and its answers deleted successfully.
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
 *       '500':
 *         description: Cannot delete question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot delete question due to database connection.
 */
questionsRouter.delete("/:id", async (req, res) => {
  const questionIdFromClient = req.params.id;
  let result;
  try {
    result = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await connectionPool.query(
      `
        with deleted_answers as (
        delete from answers
        where question_id = $1
        returning question_id)
        delete from questions where id in (select question_id from deleted_answers)
        `,
      [questionIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete a question because database connection",
    });
  }

  return res.status(200).json({
    message: "Question and its answers deleted successfully.",
  });
});

/**
 * @swagger
 * /questions/{id}/answers:
 *   post:
 *     summary: Create an answer for a question
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to which the answer belongs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is an answer to the question."
 *     responses:
 *       '201':
 *         description: Answer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer created successfully.
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid request data.
 *       '500':
 *         description: Cannot create answer due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server could not post an answer because database connection.
 */
questionsRouter.post(
  "/:id/answers",
  [validateCreateAnswerData],
  async (req, res) => {
    const questionIdFromClient = req.params.id;
    const newAnswers = {
      ...req.body,
    };
    let result;
    let result2;
    try {
      result = await connectionPool.query(
        `select * from questions where id = $1`,
        [questionIdFromClient]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          message: "Missing or invalid request data.",
        });
      }

      await connectionPool.query(
        `insert into answers (question_id, content) values ($1,$2)`,
        [questionIdFromClient, newAnswers.content]
      );

      result2 = await connectionPool.query(
        `select * from answers where question_id =$1`,
        [questionIdFromClient]
      )

    } catch (error) {
      return res.status(500).json({
        message: "Server could not post an answer because database connection",
      });
    }
    return res.status(201).json({
      message: "Answer created successfully.",
      data: result2.rows[result2.rows.length-1],
    });
  }
);
/**
 * @swagger
 * /questions/{id}/answers:
 *   get:
 *     summary: Get answers for a question by ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve answers for
 *     responses:
 *       '200':
 *         description: Successfully retrieved the answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved the answers.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       question_id:
 *                         type: integer
 *                         example: 1
 *                       content:
 *                         type: string
 *                         example: "This is an answer to the question."
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       '500':
 *         description: Cannot retrieve answers due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There is a problem with database connection.
 */
questionsRouter.get("/:id/answers", async (req, res) => {
  const questionIdFromClient = req.params.id;
  let result;

  try {
    result = await connectionPool.query(
      `select * from answers 
            where question_id = $1`,
      [questionIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: "There is a problem with database connection.",
    });
  }

  if (result.rows.length === 0) {
    return res.status(404).json({
      message: "Answers not found.",
    });
  }

  return res.status(200).json({
    message: "Successfully retrieved the answers.",
    data: result.rows,
  });
});
/**
 * @swagger
 * /questions/{id}/upvote:
 *   post:
 *     summary: Upvote a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to upvote
 *     responses:
 *       '200':
 *         description: Successfully upvoted the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully upvoted the question.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "What is OpenAPI?"
 *                     description:
 *                       type: string
 *                       example: "OpenAPI is a specification for..."
 *                     category:
 *                       type: string
 *                       example: "Technology"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *                     upvotes:
 *                       type: integer
 *                       example: 1
 *                     downvotes:
 *                       type: integer
 *                       example: 0
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       '500':
 *         description: Cannot upvote question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There's a problem with database connection.
 */
questionsRouter.post("/:id/upvote", async (req, res) => {
  const questionIdFromClient = req.params.id;
  let result;
  let voteResult;

  try {
    result = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await connectionPool.query(
      `insert into question_votes (question_id, vote)
        values($1,$2)
        `,
      [questionIdFromClient, 1]
    );

    voteResult = await connectionPool.query(
      `with votes_summary as (
            select
                question_id,
                sum(case when vote = 1 then 1 else 0 end) as upvotes,
                sum(case when vote = -1 then -1 else 0 end) as downvotes
            from question_votes where question_id = $1
            group by question_id
        )
        select
            question_id,
            upvotes,
            downvotes
        from votes_summary;`,
      [questionIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: "There's a problem with database connection",
    });
  }
  
  let summary = { ...result.rows[0], ...voteResult.rows[0] };
  delete summary.question_id;

  return res.status(200).json({
    message: "Successfully upvoted the question.",
    data: summary,
  });
});
/**
 * @swagger
 * /questions/{id}/downvote:
 *   post:
 *     summary: Downvote a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to downvote
 *     responses:
 *       '200':
 *         description: Successfully downvoted the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully downvoted the question.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "What is OpenAPI?"
 *                     description:
 *                       type: string
 *                       example: "OpenAPI is a specification for..."
 *                     category:
 *                       type: string
 *                       example: "Technology"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-27T12:00:00Z"
 *                     upvotes:
 *                       type: integer
 *                       example: 0
 *                     downvotes:
 *                       type: integer
 *                       example: 1
 *       '404':
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       '500':
 *         description: Cannot downvote question due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There's a problem with database connection.
 */
questionsRouter.post("/:id/downvote", async (req, res) => {
  const questionIdFromClient = req.params.id;
  let result;
  let voteResult;

  try {
    result = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await connectionPool.query(
      `insert into question_votes (question_id, vote)
        values($1,$2)
        `,
      [questionIdFromClient, -1]
    );

    voteResult = await connectionPool.query(
      `with votes_summary as (
            select
                question_id,
                sum(case when vote = 1 then 1 else 0 end) as upvotes,
                sum(case when vote = -1 then -1 else 0 end) as downvotes
            from question_votes where question_id = $1
            group by question_id
        )
        select
            question_id,
            upvotes,
            downvotes
        from votes_summary;`,
      [questionIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: "There's a problem with database connection",
    });
  }

  let summary = { ...result.rows[0], ...voteResult.rows[0] };
  delete summary.question_id;

  return res.status(200).json({
    message: "Successfully downvoted the question.",
    data: summary,
  });
});

export default questionsRouter;
