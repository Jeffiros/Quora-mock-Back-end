import { Router } from "express";
import connectionPool from "./utils/db.mjs";

const answersRouter = Router();

/**
 * @swagger
 * /answers/{id}/upvote:
 *   post:
 *     summary: Upvote an answer by ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the answer to upvote
 *     responses:
 *       '200':
 *         description: Successfully upvoted the answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully upvoted the answer.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     question_id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is an answer to the question."
 *                     upvotes:
 *                       type: integer
 *                       example: 1
 *                     downvotes:
 *                       type: integer
 *                       example: 0
 *       '404':
 *         description: Answer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer not found.
 *       '500':
 *         description: Cannot upvote answer due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There's a problem with database connection.
 */
answersRouter.post("/:id/upvote", async (req, res) => {
  const answerIdFromClient = req.params.id;
  let result;
  let voteResult;

  try {
    result = await connectionPool.query(`select * from answers where id = $1`, [
      answerIdFromClient,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    await connectionPool.query(
      `insert into answer_votes (answer_id, vote)
        values($1,$2)
        `,
      [answerIdFromClient, 1]
    );

    voteResult = await connectionPool.query(
      `with votes_summary as (
            select
                answer_id,
                sum(case when vote = 1 then 1 else 0 end) as upvotes,
                sum(case when vote = -1 then 1 else 0 end) as downvotes
            from answer_votes where answer_id = $1
            group by answer_id
        )
        select
            answer_id,
            upvotes,
            downvotes
        from votes_summary;`,
      [answerIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: "There's a problem with database connection",
    });
  }

  let summary = { ...result.rows[0], ...voteResult.rows[0] };
  delete summary.answer_id;

  return res.status(200).json({
    message: "Successfully upvoted the answer.",
    data: summary,
  });
});
/**
 * @swagger
 * /answers/{id}/downvote:
 *   post:
 *     summary: Downvote an answer by ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the answer to downvote
 *     responses:
 *       '200':
 *         description: Successfully downvoted the answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully downvoted the answer.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     question_id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is an answer to the question."
 *                     upvotes:
 *                       type: integer
 *                       example: 0
 *                     downvotes:
 *                       type: integer
 *                       example: 1
 *       '404':
 *         description: Answer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer not found.
 *       '500':
 *         description: Cannot downvote answer due to database connection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: There's a problem with database connection.
 */
answersRouter.post("/:id/downvote", async (req, res) => {
  const answerIdFromClient = req.params.id;
  let result;
  let voteResult;

  try {
    result = await connectionPool.query(`select * from answers where id = $1`, [
      answerIdFromClient,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    await connectionPool.query(
      `insert into answer_votes (answer_id, vote)
        values($1,$2)
        `,
      [answerIdFromClient, -1]
    );

    voteResult = await connectionPool.query(
      `with votes_summary as (
            select
                answer_id,
                sum(case when vote = 1 then 1 else 0 end) as upvotes,
                sum(case when vote = -1 then 1 else 0 end) as downvotes
            from answer_votes where answer_id = $1
            group by answer_id
        )
        select
            answer_id,
            upvotes,
            downvotes
        from votes_summary;`,
      [answerIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: "There's a problem with database connection",
    });
  }

  let summary = { ...result.rows[0], ...voteResult.rows[0] };
  delete summary.answer_id;

  return res.status(200).json({
    message: "Successfully downvoted the answer.",
    data: summary,
  });
});

export default answersRouter;
